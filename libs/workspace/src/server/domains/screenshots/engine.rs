use crate::server::core::utils::tmp_screenshot_dir;
use crate::server::{core::ServerEngineContext, core::ServerEvent};
use crate::{handle_store_events, server::io::ServerIO};
use anyhow::Result;
use paperclip_common::serialize_context::Context;
use paperclip_evaluator::css;
use paperclip_evaluator::html::serializer as html_serializer;
use paperclip_evaluator::html::virt::{Bounds, Node};
use paperclip_proto::ast::graph_ext::Dependency;
use paperclip_proto::ast::pc::{document_body_item, DocumentBodyItem};
use paperclip_proto::ast::wrapper::Expression;
use paperclip_proto::virt::html::node;
use paperclip_proto::virt::module::{pc_module_import, PcModule};
use std::collections::HashSet;
use std::sync::Arc;

use headless_chrome;
use headless_chrome::protocol::cdp::Page;

pub async fn prepare<TIO: ServerIO>(ctx: ServerEngineContext<TIO>) -> Result<()> {
    let next = ctx.clone();
    if !ctx.store.lock().unwrap().state.component_screenshots {
        return Ok(());
    }
    handle_store_events!(&next.store, ServerEvent::ModulesEvaluated(_) => {
        handle_modules_evaluated(next.clone()).await.expect("Unable to evaluate Dependency graph");
    });
    Ok(())
}

pub async fn start<TIO: ServerIO>(_ctx: ServerEngineContext<TIO>) -> Result<()> {
    Ok(())
}

async fn handle_modules_evaluated<IO: ServerIO>(ctx: ServerEngineContext<IO>) -> Result<()> {
    if ctx.store.lock().unwrap().state.screenshots_running {
        return Ok(());
    }

    tokio::spawn(async move {
        loop {
            let screenshots_queue = ctx.store.lock().unwrap().state.screenshot_queue.clone();
            if screenshots_queue.is_empty() {
                break;
            }
            ctx.emit(ServerEvent::ScreenshotsStarted);
            handle_modules_evaluated2(ctx.clone(), &screenshots_queue)
                .await
                .expect("Couldn't take screenshots");
        }

        ctx.emit(ServerEvent::ScreenshotsFinished);
    });

    Ok(())
}

async fn handle_modules_evaluated2<IO: ServerIO>(
    ctx: ServerEngineContext<IO>,
    paths: &HashSet<String>,
) -> Result<()> {
    let browser = Arc::new(headless_chrome::Browser::default()?);

    let mut to_snapshot: HashSet<String> = HashSet::new();

    for path in paths {
        let state = &ctx.store.lock().unwrap().state;
        to_snapshot.insert(path.clone());
        for dependent in state.graph.get_all_dependents(path) {
            to_snapshot.insert(dependent.path.clone());
        }
    }

    for path in to_snapshot {
        let (frames, page_info) = {
            let state = &ctx.store.lock().unwrap().state;
            let dependency = state
                .graph
                .dependencies
                .get(&path)
                .expect("Dependency must exist (screenshot engine)");

            let bundle = state.bundle_evaluated_module(&path).unwrap();

            (
                get_frame_html(&bundle, &dependency),
                get_page_html(&bundle, dependency),
            )
        };

        take_page_screenshot(
            &page_info.0,
            path.to_string(),
            page_info.2,
            page_info.1,
            browser.clone(),
        )
        .await?;

        ctx.emit(ServerEvent::ScreenshotCaptured {
            expr_id: page_info.0.to_string(),
        });

        for (frame_id, bounds, html) in frames {
            take_component_screenshot(&frame_id, bounds.clone(), html.clone(), browser.clone())
                .await?;
            ctx.emit(ServerEvent::ScreenshotCaptured {
                expr_id: frame_id.to_string(),
            });
        }
    }

    Ok(())
}

async fn take_component_screenshot(
    expr_id: &str,
    bounds: Bounds,
    html: String,
    browser: Arc<headless_chrome::Browser>,
) -> Result<()> {
    let tmp_file_path = save_tmp_page_html(&expr_id, &html)?;
    take_file_screenshot(&tmp_file_path, &expr_id, bounds, browser).await
}

fn get_page_html(bundle: &PcModule, dependency: &Dependency) -> (String, String, Bounds) {
    let mut frames = vec![];

    let mut lowest_x = 0.0;
    let mut lowest_y = 0.0;
    let mut highest_x = 10.0;
    let mut highest_y = 10.0;

    let frame_info = get_frame_html(bundle, dependency);

    for (_, bounds, _) in &frame_info {
        lowest_x = if bounds.x < lowest_x {
            bounds.x
        } else {
            lowest_x
        };
        lowest_y = if bounds.y < lowest_y {
            bounds.y
        } else {
            lowest_y
        };
        let right = bounds.x + bounds.width;
        highest_x = if right > highest_x { right } else { highest_x };
        let bottom = bounds.y + bounds.height;
        highest_y = if bottom > highest_y {
            bottom
        } else {
            highest_y
        };
    }

    for (id, bounds, _) in &frame_info {
        frames.push(format!(r#"
            <iframe style="border: none; position: absolute; left: {}px; top: {}px; width: {}px; height: {}px;" src="file://{}"></iframe>
        "#, bounds.x - lowest_x, bounds.y - lowest_y, bounds.width, bounds.height, get_tmp_html_file_path(&id)))
    }

    let html = format!(
        "<html><head><style>body {{ background: gray; }}</style></head><body>{}</body></html>",
        frames.join("\n")
    );

    (
        dependency.document.as_ref().unwrap().get_id().to_string(),
        html,
        Bounds {
            x: 0.0,
            y: 0.0,
            width: highest_x - lowest_x,
            height: highest_y - lowest_y,
        },
    )
}

async fn take_page_screenshot(
    document_id: &str,
    path: String,
    bounds: Bounds,
    html: String,
    browser: Arc<headless_chrome::Browser>,
) -> Result<()> {
    let tmp_file_path = save_tmp_page_html(document_id, &html)?;
    verbose!(&format!("📸 {}", path));
    take_file_screenshot(&tmp_file_path, &document_id, bounds, browser).await
}

async fn take_file_screenshot(
    file_path: &str,
    id: &str,
    bounds: Bounds,
    browser: Arc<headless_chrome::Browser>,
) -> Result<()> {
    let tab = browser.new_tab()?;
    tab.set_bounds(headless_chrome::types::Bounds::Normal {
        left: None,
        top: None,
        width: Some(bounds.width as f64),
        height: Some(bounds.height as f64),
    })?;

    tab.navigate_to(format!("file://{}", file_path).as_str())?;
    tab.wait_for_element("body")?;

    let image = tab.capture_screenshot(
        Page::CaptureScreenshotFormatOption::Png,
        Some(75),
        None,
        true,
    )?;

    tab.close(true)?;

    std::fs::write(
        format!(
            "{}/{}.png",
            tmp_screenshot_dir().to_str().unwrap().to_string(),
            id
        ),
        image,
    )?;

    Ok(())
}

fn get_tmp_html_file_path(id: &str) -> String {
    let tmp_dir = tmp_screenshot_dir();
    let file_name = format!("{}.html", id);
    tmp_dir.join(&file_name).to_str().unwrap().to_string()
}

fn save_tmp_page_html(id: &str, html: &str) -> Result<String> {
    let file_path = get_tmp_html_file_path(id);
    let tmp_dir = tmp_screenshot_dir();
    std::fs::create_dir_all(tmp_dir.clone()).expect("Couldn't create directory");
    std::fs::write(&file_path, &html)?;
    Ok(file_path)
}

fn get_frame_html(bundle: &PcModule, dependency: &Dependency) -> Vec<(String, Bounds, String)> {
    let head = stringify_module_bundle_head(bundle);

    let mut frames = vec![];

    for child in &bundle.html.as_ref().unwrap().children {
        let id = match child.get_inner() {
            node::Inner::Element(node) => node.id.to_string(),
            node::Inner::TextNode(node) => node.id.to_string(),
        };

        if let Some(source) = get_doc_body_item_from_source_id(&id, dependency) {
            let bounds = get_virt_node_bounds(child);
            let mut ctx = Context::new(0);
            html_serializer::serialize_node(child, &mut ctx);
            let body = ctx.buffer;
            let html = format!("<head>{}</head><body>{}</body>", head, body);

            frames.push((source.get_id().to_string(), bounds, html));
        }
    }

    // for component in dependency
    //     .document
    //     .as_ref()
    //     .expect("Document must exist!")
    //     .get_components()
    // {
    //     if let Some((virt_node, bounds)) = get_component_virt_node_and_bounds(component, bundle) {

    //         let mut ctx = Context::new(0);
    //         html_serializer::serialize_node(virt_node, &mut ctx);

    //         let body = ctx.buffer;
    //         let html = format!("<head>{}</head><body>{}</body>", head, body);

    //         component_frames.push((component.clone(), bounds, html));
    //     }
    // }

    frames
}

fn get_doc_body_item_from_source_id<'a>(
    id: &str,
    dep: &'a Dependency,
) -> Option<&'a DocumentBodyItem> {
    dep.document.as_ref().unwrap().body.iter().find(|item| {
        item.get_id() == id || {
            match item.get_inner() {
                document_body_item::Inner::Component(component) => {
                    let render_expr = component.get_render_expr();
                    if let Some(render_expr) = render_expr {
                        render_expr.node.as_ref().unwrap().get_id() == id
                    } else {
                        false
                    }
                }
                _ => false,
            }
        }
    })
}

fn get_virt_node_bounds(node: &Node) -> Bounds {
    node.get_metadata()
        .as_ref()
        .and_then(|metadata| metadata.bounds.clone())
        .unwrap_or(Bounds {
            x: 0.0,
            y: 0.0,
            width: 1024.0,
            height: 768.0,
        })
}

// fn get_component_virt_node_and_bounds<'a>(component: &Component, bundle: &'a PcModule) -> Option<(&'a Node, Bounds)> {

//     if let Some(virt_node) =
//     get_component_virt_node(component, bundle.html.as_ref().expect("HTML must exist!"))
// {
//     let bounds = virt_node
//         .get_metadata()
//         .as_ref()
//         .and_then(|metadata| metadata.bounds.clone())
//         .unwrap_or(Bounds {
//             x: 0.0,
//             y: 0.0,
//             width: 1024.0,
//             height: 768.0,
//         });

//         Some((virt_node, bounds))
//     } else {
//         None
//     }

// }

fn stringify_module_bundle_head(bundle: &PcModule) -> String {
    let mut head = r#"<style>
        html, body {
            overflow: hidden;
        }
    </style>"#
        .to_string();

    for import in &bundle.imports {
        match import.inner.as_ref().expect("Inner must exist") {
            pc_module_import::Inner::Css(imp) => {
                head = format!(
                    r#"
          {}
          <style>{}</style>
          "#,
                    head,
                    css::serializer::serialize(imp.css.as_ref().unwrap())
                );
            }
            _ => {}
        }
    }

    head = format!(
        "{}<style>{}</style>",
        head,
        css::serializer::serialize(bundle.css.as_ref().unwrap())
    );

    head
}
