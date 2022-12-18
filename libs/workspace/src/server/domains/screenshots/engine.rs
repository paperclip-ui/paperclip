use crate::server::core::utils::tmp_screenshot_dir;
use crate::server::{core::ServerEngineContext, core::ServerEvent};
use crate::{handle_store_events, server::io::ServerIO};
use ansi_term::Colour;
use anyhow::Result;
use paperclip_common::serialize_context::Context;
use paperclip_evaluator::css;
use paperclip_evaluator::html::serializer as html_serializer;
use paperclip_evaluator::html::virt::Bounds;
use paperclip_proto::ast::all::Expression;
use paperclip_proto::ast::graph_ext::Dependency;
use paperclip_proto::ast::pc::Component;
use paperclip_proto::virt::html::{self, node};
use paperclip_proto::virt::module::{pc_module_import, PcModule};
use std::collections::{HashMap, HashSet};
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

async fn handle_modules_evaluated<IO: ServerIO>(
    ctx: ServerEngineContext<IO>
) -> Result<()> {
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
            handle_modules_evaluated2(ctx.clone(), &screenshots_queue).await;
        }

        ctx.emit(ServerEvent::ScreenshotsFinished);
    });

    Ok(())
}

async fn handle_modules_evaluated2<IO: ServerIO>(
    ctx: ServerEngineContext<IO>,
    paths: &HashSet<String>
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
        let frames = {
            let state = &ctx.store.lock().unwrap().state;
            let dependency = state
                .graph
                .dependencies
                .get(&path)
                .expect("Dependency must exist!");

            let bundle = state.bundle_evaluated_module(&path).unwrap();

            get_component_frame_html(&bundle, &dependency)
        };

        for (component, bounds, html) in frames {
            take_component_screenshot(
                component.clone(),
                path.to_string(),
                bounds.clone(),
                html.clone(),
                browser.clone(),
            )
            .await?;
            ctx.emit(ServerEvent::ScreenshotCaptured {
                component_id: component.id.to_string(),
            });
        }
    }

    Ok(())
}

async fn take_component_screenshot(
    component: Component,
    path: String,
    bounds: Bounds,
    html: String,
    browser: Arc<headless_chrome::Browser>,
) -> Result<()> {
    let tmp_file_path = save_tmp_component_html(&component, &html)?;

    let tab = browser.new_tab()?;
    tab.set_bounds(headless_chrome::types::Bounds::Normal {
        left: None,
        top: None,
        width: Some(bounds.width as f64),
        height: Some(bounds.height as f64),
    })?;

    tab.navigate_to(format!("file://{}", tmp_file_path).as_str())?;
    tab.wait_for_element("body")?;

    let style = Colour::White.dimmed();
    println!("📸 {} {}", component.name, style.paint(path));

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
            component.id
        ),
        image,
    )?;

    Ok(())
}

fn save_tmp_component_html(component: &Component, html: &str) -> Result<String> {
    let file_name = format!("component-{}.html", component.get_id());

    let tmp_dir = tmp_screenshot_dir();

    std::fs::create_dir_all(tmp_dir.clone());

    let file_path = tmp_dir.join(&file_name).to_str().unwrap().to_string();

    std::fs::write(&file_path, &html)?;

    Ok(file_path)
}

fn get_component_frame_html(
    bundle: &PcModule,
    dependency: &Dependency,
) -> Vec<(Component, Bounds, String)> {
    let head = stringify_module_bundle_head(bundle);

    let mut component_frames = vec![];

    for component in dependency
        .document
        .as_ref()
        .expect("Document must exist!")
        .get_components()
    {
        if let Some(virt_node) =
            get_component_virt_node(component, bundle.html.as_ref().expect("HTML must exist!"))
        {
            let bounds = virt_node
                .get_metadata()
                .as_ref()
                .and_then(|metadata| metadata.bounds.clone())
                .unwrap_or(Bounds {
                    x: 0.0,
                    y: 0.0,
                    width: 1024.0,
                    height: 768.0,
                });

            let mut ctx = Context::new(0);
            html_serializer::serialize_node(virt_node, &mut ctx);

            let body = ctx.buffer;
            let html = format!("<head>{}</head><body>{}</body>", head, body);

            component_frames.push((component.clone(), bounds, html));
        }
    }

    component_frames
}

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

fn get_component_virt_node<'a>(
    component: &Component,
    virt_doc: &'a html::Document,
) -> Option<&'a html::Node> {
    virt_doc.children.iter().find(|child| {
        let render_node = component
            .get_render_expr()
            .and_then(|expr| expr.node.as_ref());

        if let Some(rende_node) = render_node {
            match child.get_inner() {
                node::Inner::Element(node) => {
                    node.source_id == Some(rende_node.get_id().to_string())
                }
                node::Inner::TextNode(node) => {
                    node.source_id == Some(rende_node.get_id().to_string())
                }
            }
        } else {
            false
        }
    })
}
