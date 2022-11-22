use super::context::Context;
use anyhow::{Error, Result};
use css_color::Srgb;
use paperclip_common::get_or_short;
use paperclip_common::serialize_context::Context as SerializeContext;

use paperclip_proto::ast::{
    css as css_ast,
    css::{declaration_value, StyleDeclaration},
    graph_ext::Graph,
    pc::*
};
use paperclip_parser::css;
use paperclip_proto::ast::base;
use paperclip_proto::language_service::pc::{ColorInfo, ColorValue, DocumentInfo, Position};

pub fn get_document_info(path: &str, graph: &Graph) -> Result<DocumentInfo> {
    let mut ctx = Context {
        path: path.to_string(),
        graph,
        info: DocumentInfo { colors: vec![] },
        source_position: None,
    };

    let dep = get_or_short!(
        ctx.graph.dependencies.get(path),
        Err(Error::msg("path does not exist"))
    );
    let ast = dep.document.as_ref().expect("Document must exist");

    for item in &ast.body {
        match item.get_inner() {
            document_body_item::Inner::Atom(expr) => {
                scan_atom(expr, &mut ctx);
            }
            document_body_item::Inner::Style(expr) => {
                scan_style(expr, &mut ctx);
            }
            document_body_item::Inner::Component(expr) => {
                scan_component(expr, &mut ctx);
            }
            document_body_item::Inner::Element(expr) => {
                scan_element(expr, &mut ctx);
            }
            document_body_item::Inner::Text(expr) => {
                scan_text(expr, &mut ctx);
            }
            _ => {}
        }
    }

    Ok(ctx.info)
}

fn scan_atom(atom: &Atom, ctx: &mut Context) {
    scan_declaration_value(
        atom.value.as_ref().expect("Value must exist").get_inner(),
        ctx,
    );
}

fn scan_style(style: &Style, ctx: &mut Context) {
    for decl in &style.declarations {
        scan_declaration(decl, ctx);
    }
}

fn scan_component(component: &Component, ctx: &mut Context) {
    for item in &component.body {
        match item.get_inner() {
            component_body_item::Inner::Render(render) => {
                scan_render_node(render.node.as_ref().unwrap().get_inner(), ctx);
            }
            _ => {}
        }
    }
}

fn scan_render_node(node: &node::Inner, ctx: &mut Context) {
    match node {
        node::Inner::Element(element) => {
            scan_element(element, ctx);
        }
        node::Inner::Slot(element) => {
            scan_slot(element, ctx);
        }
        _ => {}
    }
}

fn scan_element(element: &Element, ctx: &mut Context) {
    for item in &element.body {
        match item.get_inner() {
            node::Inner::Element(element) => {
                scan_element(element, ctx);
            }
            node::Inner::Override(element) => {
                scan_override(element, ctx);
            }
            node::Inner::Text(expr) => {
                scan_text(expr, ctx);
            }
            node::Inner::Insert(expr) => {
                scan_insert(expr, ctx);
            }
            node::Inner::Style(element) => {
                scan_style(element, ctx);
            }
            _ => {}
        }
    }
}

fn scan_slot(expr: &Slot, ctx: &mut Context) {
    for item in &expr.body {
        match item.get_inner() {
            node::Inner::Element(expr) => {
                scan_element(expr, ctx);
            }
            node::Inner::Text(expr) => {
                scan_text(expr, ctx);
            }
            _ => {}
        }
    }
}

fn scan_override(expr: &Override, ctx: &mut Context) {
    for item in &expr.body {
        match item.get_inner() {
            override_body_item::Inner::Style(expr) => {
                scan_style(expr, ctx);
            }
            _ => {}
        }
    }
}

fn scan_insert(expr: &Insert, ctx: &mut Context) {
    for item in &expr.body {
        match item.get_inner() {
            node::Inner::Element(expr) => {
                scan_element(expr, ctx);
            }
            node::Inner::Text(expr) => {
                scan_text(expr, ctx);
            }
            _ => {}
        }
    }
}

fn scan_text(element: &TextNode, ctx: &mut Context) {
    for item in &element.body {
        match item.get_inner() {
            node::Inner::Style(expr) => {
                scan_style(expr, ctx);
            }
            _ => {}
        }
    }
}

fn scan_declaration(decl: &StyleDeclaration, ctx: &mut Context) {
    scan_declaration_value(
        decl.value.as_ref().expect("Value must exist").get_inner(),
        ctx,
    );
}

fn scan_declaration_value(value: &declaration_value::Inner, ctx: &mut Context) {
    match value {
        declaration_value::Inner::SpacedList(list) => {
            for item in &list.items {
                scan_declaration_value(item.get_inner(), ctx);
            }
        }
        declaration_value::Inner::CommaList(list) => {
            for item in &list.items {
                scan_declaration_value(item.get_inner(), ctx);
            }
        }
        declaration_value::Inner::FunctionCall(call) => {
            // TODO: check for rgb, rgba
            scan_declaration_value(call.arguments.as_ref().unwrap().get_inner(), ctx);

            if matches!(&call.name.as_str(), &("rgba" | "rgb" | "hsl" | "hsla")) {
                let mut context = SerializeContext::new(0);

                // a bit crude, but whatever...
                css::serializer::serialize_decl_value(
                    &css_ast::DeclarationValue {
                        inner: Some(declaration_value::Inner::FunctionCall(call.clone())),
                    },
                    &mut context,
                );

                if let Ok(rgba) = context.buffer.parse::<Srgb>() {
                    add_color(rgba, call.range.as_ref().unwrap(), ctx);
                }
            } else if call.name == "var" {
                if let Some(atom) = ctx.graph.get_var_ref(call, &ctx.path) {
                    let mut sub = ctx.clone().with_source_position(Position {
                        start: call.range.as_ref().unwrap().start.as_ref().unwrap().pos,
                        end: call.range.as_ref().unwrap().end.as_ref().unwrap().pos,
                    });
                    scan_atom(atom, &mut sub);
                    ctx.extend(sub);
                }
            }
        }
        declaration_value::Inner::Reference(reference) => {
            if reference.path.len() == 1 {
                if let Some(part) = reference.path.get(0).as_ref() {
                    if let Ok(rgba) = format!("{}", part).parse::<Srgb>() {
                        add_color(rgba, reference.range.as_ref().unwrap(), ctx);
                    }
                }
            }
        }
        declaration_value::Inner::HexColor(color) => {
            let rgba: Srgb = format!("#{}", color.value).parse().unwrap();
            add_color(rgba, color.range.as_ref().unwrap(), ctx);
        }
        _ => {}
    }
}

fn add_color(rgba: Srgb, range: &base::Range, ctx: &mut Context) {
    ctx.info.colors.push(ColorInfo {
        value: Some(ColorValue {
            red: rgba.red * 255.0,
            green: rgba.green * 255.0,
            blue: rgba.blue * 255.0,
            alpha: rgba.alpha,
        }),
        position: Some(ctx.source_position.clone().unwrap_or(Position {
            start: range.start.as_ref().unwrap().pos,
            end: range.end.as_ref().unwrap().pos,
        })),
    });
}
