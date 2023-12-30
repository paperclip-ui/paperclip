use super::base::EditContext;
use super::utils::import_dep;
use super::utils::resolve_import_ns;
use paperclip_proto::ast;
use paperclip_proto::ast::all::visit::MutableVisitor;
use paperclip_proto::ast::all::visit::VisitorResult;
use paperclip_proto::ast::shared::Reference;
use paperclip_proto::ast_mutate::SetStyleMixins;

use paperclip_proto::ast::get_expr::GetExpr;

impl MutableVisitor<()> for EditContext<SetStyleMixins> {
    fn visit_document(&mut self, expr: &mut ast::pc::Document) -> VisitorResult<()> {
        if GetExpr::get_expr(&self.mutation.target_expr_id, expr).is_none() {
            return VisitorResult::Continue;
        }

        for mixin_id in &self.mutation.mixin_ids {
            let (_, dep) =
                GetExpr::get_expr_from_graph(mixin_id, &self.graph).expect("Mixin must exist");

            if dep.path != self.get_dependency().path {
                import_dep(expr, &dep.path, self);
            }
        }

        VisitorResult::Continue
    }
    fn visit_style(&mut self, expr: &mut ast::pc::Style) -> VisitorResult<()> {
        if self.mutation.target_expr_id != expr.id {
            return VisitorResult::Continue;
        }

        edit_style(expr, &self);

        return VisitorResult::Return(());
    }
    fn visit_text_node(&mut self, node: &mut ast::pc::TextNode) -> VisitorResult<()> {
        if self.mutation.target_expr_id != node.id {
            return VisitorResult::Continue;
        }

        let variant_combo = self
            .mutation
            .variant_ids
            .iter()
            .map(|x| {
                let (variant, _) =
                    GetExpr::get_expr_from_graph(x, &self.graph).expect("Variant must exist");
                let variant: ast::pc::Variant = variant.try_into().expect("Must be variant");
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
    fn visit_element(&mut self, element: &mut ast::pc::Element) -> VisitorResult<()> {
        if self.mutation.target_expr_id != element.id {
            return VisitorResult::Continue;
        }

        let variant_combo = self
            .mutation
            .variant_ids
            .iter()
            .map(|x| {
                let (variant, _) =
                    GetExpr::get_expr_from_graph(x, &self.graph).expect("Variant must exist");
                let variant: ast::pc::Variant = variant.try_into().expect("Must be variant");
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

fn edit_style(style: &mut ast::pc::Style, ctx: &EditContext<SetStyleMixins>) {
    style.extends = vec![];
    let mutation = &ctx.mutation;
    let graph = &ctx.graph;
    let style_dep = ctx.get_dependency();

    for mixin_id in &mutation.mixin_ids {
        let (mixin, dep) =
            GetExpr::get_expr_from_graph(mixin_id, &graph).expect("Mixin must exist");

        let mixin: ast::pc::Style = mixin.try_into().expect("Must be style");
        let mut path = vec![mixin.name.expect("Name must exist").clone()];

        if dep.path != style_dep.path {
            path.insert(0, resolve_import_ns(style_dep, &dep.path).0)
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
