use std::{cell::RefCell, collections::HashMap, path::Path, rc::Rc};

use paperclip_common::{fs::FileResolver, serialize_context::Context};
use paperclip_proto::ast::{
    css::declaration_value,
    graph::Dependency,
    pc::{simple_expression, Element, SimpleExpression},
    visit::{Visitable, Visitor, VisitorResult},
};

use paperclip_ast_serialize::css::serialize_decl_value;

struct AssetCollector {
    assets: Rc<RefCell<Vec<String>>>,
}

impl Visitor<()> for AssetCollector {
    fn visit_css_declaration_value(
        &self,
        value: &paperclip_proto::ast::css::DeclarationValue,
    ) -> VisitorResult<(), Self> {
        if let declaration_value::Inner::FunctionCall(call) = value.get_inner() {
            if call.name == "url" {
                if let Some(argument) = &call.arguments {
                    let mut context = Context::new(0);
                    serialize_decl_value(argument, &mut context);
                    let url = context.buffer.replace("\"", "").replace("'", "");
                    self.assets.borrow_mut().push(url);
                }
            }
        }

        VisitorResult::Continue
    }
    fn visit_element(&self, element: &Element) -> VisitorResult<(), Self> {
        if element.tag_name == "img" {
            let src = element
                .parameters
                .iter()
                .map(|param| {
                    if param.name == "src" {
                        if let Some(SimpleExpression {
                            inner: Some(simple_expression::Inner::Str(str)),
                        }) = &param.value
                        {
                            return Some(str.value.clone());
                        }
                    }
                    None
                })
                .find(|v| v.is_some())
                .unwrap_or(None);

            if let Some(src) = src {
                self.assets.borrow_mut().push(src);
            }
        }
        VisitorResult::Continue
    }
}

pub fn collect_assets<IO: FileResolver>(
    dep: &Dependency,
    file_resolver: &IO,
) -> HashMap<String, String> {
    let assets = Rc::new(RefCell::new(vec![]));

    let collector = AssetCollector {
        assets: assets.clone(),
    };

    dep.get_document().accept(&collector);

    let x = assets
        .borrow()
        .clone()
        .into_iter()
        .map(|relative_path| {
            file_resolver
                .resolve_file(&dep.path, &relative_path)
                .and_then(|resolved_path| Ok((relative_path.to_string(), resolved_path.clone())))
        })
        .filter(|v| v.is_ok())
        .map(|v| v.unwrap())
        .collect();

    x
}
