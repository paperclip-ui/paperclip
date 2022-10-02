

use paperclip_parser::{pc::{ast::*}, css, css::ast::{declaration_value, StyleDeclaration}};
use paperclip_proto::ast::base;
use paperclip_common::serialize_context::Context as SerializeContext;
use crate::state::{DocumentInfo, ColorInfo, Color as ColorValue};
use css_color::Srgb;


pub fn get_document_info(ast: &Document) -> DocumentInfo {
  let mut info = DocumentInfo {
    colors: vec![]
  };

  for item in &ast.body {
    match item.get_inner() {
      document_body_item::Inner::Atom(atom) => {
        scan_atom(atom, &mut info);
      },
      document_body_item::Inner::Style(atom) => {
        scan_style(atom, &mut info);
      },
      document_body_item::Inner::Component(atom) => {
        scan_component(atom, &mut info);
      },
      document_body_item::Inner::Element(atom) => {
        scan_element(atom, &mut info);
      },
      _ => {
  
      }
    }
  }

  info
}

fn scan_atom(atom: &Atom, info: &mut DocumentInfo) {
  scan_declaration_value(atom.value.as_ref().expect("Value must exist").get_inner(), info);
}

fn scan_style(style: &Style, info: &mut DocumentInfo) {
  for decl in &style.declarations {
    scan_declaration(decl, info);
  }
}

fn scan_component(component: &Component, info: &mut DocumentInfo) {
  for item in &component.body {
    match item.get_inner() {
      component_body_item::Inner::Render(render) => {
        scan_render_node(render.node.as_ref().unwrap().get_inner(), info);
      },
      _ => {}
    }
  }
}



fn scan_render_node(node: &render_node::Inner, info: &mut DocumentInfo) {
  match node {
    render_node::Inner::Element(element)  =>{
      scan_element(element, info);
    },
    _ => {}
  }
}

fn scan_element(element: &Element, info: &mut DocumentInfo) {
  for item in &element.body {
    match item.get_inner() {
      element_body_item::Inner::Element(element) => {
        scan_element(element, info);
      },
      element_body_item::Inner::Style(element) => {
        scan_style(element, info);
      },
      _ => {}
    }
  }
}

fn scan_declaration(decl: &StyleDeclaration, info: &mut DocumentInfo) {
  scan_declaration_value(decl.value.as_ref().expect("Value must exist").get_inner(), info);
}

fn scan_declaration_value(value: &declaration_value::Inner, info: &mut DocumentInfo) {

  match value {
    declaration_value::Inner::SpacedList(list) => {
      for item in &list.items {
        scan_declaration_value(item.get_inner(), info);
      }
    },
    declaration_value::Inner::CommaList(list) => {
      for item in &list.items {
        scan_declaration_value(item.get_inner(), info);
      }
    },
    declaration_value::Inner::FunctionCall(call) => {
      // TODO: check for rgb, rgba
      scan_declaration_value(call.arguments.as_ref().unwrap().get_inner(), info);

      if matches!(&call.name.as_str(), &("rgba" | "rgb" | "hsl" | "hsla")) {
        let mut context = SerializeContext::new(0);
        let color_str = css::serializer::serialize_decl_value(&css::ast::DeclarationValue {
          inner: Some(declaration_value::Inner::FunctionCall(call.clone()))
        }, &mut context);


        if let Ok(rgba) = context.buffer.parse::<Srgb>() {
          add_color(rgba, call.range.as_ref().unwrap(), info);
        }
      }
    },
    declaration_value::Inner::Reference(reference) => {
      if reference.path.len() == 1 {
        if let Some(part) = reference.path.get(0).as_ref() {
          if let Ok(rgba) = format!("{}", part).parse::<Srgb>() {
            add_color(rgba, reference.range.as_ref().unwrap(), info);
          }
        }
      }
    },
    declaration_value::Inner::HexColor(color) => {
      let rgba: Srgb = format!("#{}", color.value).parse().unwrap();
      println!("{:?}", color.range);
      add_color(rgba, color.range.as_ref().unwrap(), info);
    },
    _ => {

    }
  }

}

fn add_color(rgba: Srgb, range: &base::Range, info: &mut DocumentInfo) {
  info.colors.push(ColorInfo {
    value: ColorValue {
      red: rgba.red * 255.0,
      green: rgba.green * 255.0,
      blue: rgba.blue * 255.0,
      alpha: rgba.alpha
    },
    start: range.start.as_ref().unwrap().pos,
    end: range.end.as_ref().unwrap().pos
  });
}