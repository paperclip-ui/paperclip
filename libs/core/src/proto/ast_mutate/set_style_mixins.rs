use super::base::EditContext;
use super::utils::import_dep;
use super::utils::resolve_import_ns;
use paperclip_proto::ast;
use paperclip_proto::ast::shared::Reference;
use paperclip_proto::ast::visit::MutableVisitor;
use paperclip_proto::ast::visit::VisitorResult;
use paperclip_proto::ast_mutate::SetStyleMixins;

impl MutableVisitor<()> for EditContext<SetStyleMixins> {
    fn visit_document(&self, expr: &mut ast::pc::Document) -> VisitorResult<(), Self> {
        if self
            .expr_map
            .get_expr_in(&self.mutation.target_expr_id, &expr.id)
            .is_none()
        {
            return VisitorResult::Continue;
        }

        for mixin_id in &self.mutation.mixin_ids {
            let expr_path = self
                .expr_map
                .get_expr_path(mixin_id)
                .expect("Mixin must exist");

            if expr_path != &self.get_dependency().path {
                let _ = import_dep(expr, expr_path, None, self);
            }
        }

        VisitorResult::Continue
    }
    fn visit_style(&self, expr: &mut ast::pc::Style) -> VisitorResult<(), Self> {
        if self.mutation.target_expr_id != expr.id {
            return VisitorResult::Continue;
        }

        edit_style(expr, &self);

        return VisitorResult::Return(());
    }
    fn visit_text_node(&self, node: &mut ast::pc::TextNode) -> VisitorResult<(), Self> {
        if self.mutation.target_expr_id != node.id {
            return VisitorResult::Continue;
        }

        let variant_combo = self
            .mutation
            .variant_ids
            .iter()
            .map(|x| {
                let variant = self.expr_map.get_expr(x).expect("Variant must exist");
                let variant: ast::pc::Variant =
                    variant.clone().try_into().expect("Must be variant");
                variant.name.clone()
            })
            .collect::<Vec<String>>();

        let style = get_text_node_style(node, &variant_combo);

        let mut style: &mut ast::pc::Style = (if style.is_none() {
            node.body.push(
                ast::pc::node::Inner::Style(ast::pc::Style {
                    id: self.new_id(),
                    is_public: false,
                    range: None,
                    declarations: vec![],
                    variant_combo: variant_combo
                        .iter()
                        .map(|x| ast::shared::Reference {
                            id: self.new_id(),
                            path: vec![x.clone()],
                            range: None,
                        })
                        .collect::<Vec<ast::shared::Reference>>(),
                    name: None,
                    extends: vec![],
                })
                .get_outer(),
            );

            node.body.last_mut().unwrap()
        } else {
            style.unwrap()
        })
        .try_into()
        .expect("Must be style");

        edit_style(&mut style, &self);

        return VisitorResult::Return(());
    }
    fn visit_element(&self, element: &mut ast::pc::Element) -> VisitorResult<(), Self> {
        if self.mutation.target_expr_id != element.id {
            return VisitorResult::Continue;
        }

        let variant_combo = self
            .mutation
            .variant_ids
            .iter()
            .map(|x| {
                let variant = self.expr_map.get_expr(x).expect("Variant must exist");
                let variant: ast::pc::Variant =
                    variant.clone().try_into().expect("Must be variant");
                variant.name.clone()
            })
            .collect::<Vec<String>>();

        let style = get_element_style(element, &variant_combo);

        let mut style: &mut ast::pc::Style = (if style.is_none() {
            element.body.push(
                ast::pc::node::Inner::Style(ast::pc::Style {
                    id: self.new_id(),
                    is_public: false,
                    range: None,
                    declarations: vec![],
                    variant_combo: variant_combo
                        .iter()
                        .map(|x| ast::shared::Reference {
                            id: self.new_id(),
                            path: vec![x.clone()],
                            range: None,
                        })
                        .collect::<Vec<ast::shared::Reference>>(),
                    name: None,
                    extends: vec![],
                })
                .get_outer(),
            );

            element.body.last_mut().unwrap()
        } else {
            style.unwrap()
        })
        .try_into()
        .expect("Must be style");

        edit_style(&mut style, &self);

        return VisitorResult::Return(());
    }
}

/*

impl Fold for GetIdPath {
    fn visit_element
}
*/

fn edit_style(style: &mut ast::pc::Style, ctx: &EditContext<SetStyleMixins>) {
    style.extends = vec![];
    let mutation = &ctx.mutation;
    let style_dep = ctx.get_dependency();

    for mixin_id in &mutation.mixin_ids {
        let mixin = ctx
            .expr_map
            .get_expr(mixin_id)
            .expect("Mixin must exist")
            .clone();

        let mixin_path = ctx
            .expr_map
            .get_expr_path(mixin_id)
            .expect("Mixin must exist");

        let mixin: ast::pc::Style = mixin.try_into().expect("Must be style");
        let mut path = vec![mixin.name.expect("Name must exist").clone()];

        if mixin_path != &style_dep.path {
            if let Ok(imp) = resolve_import_ns(style_dep, mixin_path, None) {
                path.insert(0, imp.namespace);
            }
        }

        style.extends.push(Reference {
            id: ctx.new_id(),
            range: None,
            path,
        });
    }
}

fn get_element_style<'a>(
    element: &'a mut ast::pc::Element,
    variant_combo: &Vec<String>,
) -> Option<&'a mut ast::pc::Node> {
    element.body.iter_mut().find(|x| {
        if let ast::pc::node::Inner::Style(style) = x.get_inner() {
            variant_combo_equals(&style.variant_combo, variant_combo)
        } else {
            false
        }
    })
}

fn get_text_node_style<'a>(
    text_node: &'a mut ast::pc::TextNode,
    variant_combo: &Vec<String>,
) -> Option<&'a mut ast::pc::Node> {
    text_node.body.iter_mut().find(|x| {
        if let ast::pc::node::Inner::Style(style) = x.get_inner() {
            variant_combo_equals(&style.variant_combo, variant_combo)
        } else {
            false
        }
    })
}

fn variant_combo_equals(variant_combo: &Vec<Reference>, variant_combo2: &Vec<String>) -> bool {
    if variant_combo.len() != variant_combo2.len() {
        return false;
    }

    for (i, variant) in variant_combo.iter().enumerate() {
        if variant.path.len() != 1 {
            return false;
        }

        if variant.path[0] != variant_combo2[i] {
            return false;
        }
    }

    true
}
