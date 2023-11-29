use crate::{
    context::Options,
    utils::{get_node_name, node_contains_script, COMPILER_NAME},
};

use super::context::Context;
use anyhow::Result;
use crc::crc32;
use inflector::cases::pascalcase::to_pascal_case;
use paperclip_common::get_or_short;
use paperclip_evaluator::core::utils::get_style_namespace;
use paperclip_infer::infer;
use paperclip_proto::ast::{
    all::{
        visit::{MutableVisitable, MutableVisitor, VisitorResult},
        Expression,
    },
    get_expr::GetExpr,
    graph_ext::{Dependency, Graph},
    pc as ast,
    shared::Reference,
};
use std::collections::BTreeMap;

#[derive(Debug, Clone, Copy, Default)]
struct Info {
    is_component_render_node: bool,
    is_script_render_node: bool,
    is_instance: bool,
}

impl Info {
    fn set_is_instance(&self, is_instance: bool) -> Info {
        Info {
            is_instance,
            ..self.clone()
        }
    }
    fn set_is_component_render_node(&self, is_component_render_node: bool) -> Info {
        Info {
            is_component_render_node,
            ..self.clone()
        }
    }
    fn set_is_script_render_node(&self, is_script_render_node: bool) -> Info {
        Info {
            is_script_render_node,
            ..self.clone()
        }
    }
}

pub fn compile_code(dependency: &Dependency, graph: &Graph, options: Options) -> Result<String> {
    let mut context = Context::new(&dependency, graph, options);
    compile_document(
        dependency.document.as_ref().expect("Document must exist"),
        &mut context,
    );
    Ok(context.get_buffer())
}

fn compile_document(document: &ast::Document, context: &mut Context) {
    let mut imports = BTreeMap::new();

    collect_imports(document, &mut imports, context);
    compile_imports(&imports, context);
    compile_nested_components(document, context);
    for item in &document.body {
        match item.get_inner() {
            ast::document_body_item::Inner::Component(component) => {
                compile_component(&component, context)
            }
            _ => {}
        }
    }
}

fn collect_imports(
    document: &ast::Document,
    imports: &mut BTreeMap<String, Option<String>>,
    context: &mut Context,
) {
    imports.insert(
        format!(
            "./{}.css",
            std::path::Path::new(&context.dependency.path)
                .file_name()
                .unwrap()
                .to_str()
                .unwrap()
        ),
        None,
    );

    imports.insert("react".to_string(), Some("React".to_string()));

    for item in &document.body {
        match item.get_inner() {
            ast::document_body_item::Inner::Import(import) => {
                imports.insert(import.path.to_string(), Some(import.namespace.to_string()));
            }
            ast::document_body_item::Inner::Component(component) => {
                if let Some(script) = component.get_script(COMPILER_NAME) {
                    let src = script.get_src().expect("src must exist");

                    imports.insert(
                        src.clone(),
                        Some(format!("_{:x}", crc32::checksum_ieee(src.as_bytes())).to_string()),
                    );
                }
            }
            _ => {}
        }
    }

    let found = FindNodesWithScripts::find(document);
    for node in &found {
        add_nested_component_import(&node, imports);
    }
}

struct FindNodesWithScripts {
    found: Vec<ast::Node>,
}

impl FindNodesWithScripts {
    fn find(document: &ast::Document) -> Vec<ast::Node> {
        let mut inst = FindNodesWithScripts { found: vec![] };
        document.clone().accept(&mut inst);
        inst.found.clone()
    }
}

impl MutableVisitor<()> for FindNodesWithScripts {
    fn visit_node(&mut self, node: &mut ast::Node) -> VisitorResult<()> {
        if node_contains_script(node) {
            self.found.push(node.clone());
        }
        VisitorResult::Continue
    }
}

fn compile_nested_components(document: &ast::Document, context: &mut Context) {
    let found = FindNodesWithScripts::find(document);
    // let mut imports: HashMap<String, HashMap<String, String>> = HashMap::new();
    // for node in &found {
    //     add_nested_component_import(&node, &mut imports);
    // }

    // for (path, namespaces) in imports {
    //     let mut namespaces = namespaces.into_iter().peekable();

    //     context.add_buffer("import { ");
    //     while let Some((namespace, import_as)) = namespaces.next() {
    //         context.add_buffer(format!("{} as {}", namespace, import_as).as_str());
    //         if !namespaces.peek().is_none() {
    //             context.add_buffer(", ");
    //         }
    //     }
    //     context.add_buffer(format!(" }} from \"{}\"", path).as_str());
    // }

    context.add_buffer("\n");
    for node in &found {
        compile_nested_component(&node, document, context);
    }
}

fn add_nested_component_import(
    node: &ast::Node,
    script_imports: &mut BTreeMap<String, Option<String>>,
) {
    // let (export_name, import_name) = get_node_import(node);
    let script: ast::Script = get_node_script(node);
    let src = script.get_src().expect("src must exist");
    // let mut namespace_imports: HashMap<String, String> =
    //     script_imports.get(&src).unwrap_or(&HashMap::new()).clone();

    // namespace_imports.insert(export_name, import_name);
    script_imports.insert(
        src.to_string(),
        Some(format!("_{:x}", crc32::checksum_ieee(src.as_bytes())).to_string()),
    );
}

fn get_body_script(body: &Vec<ast::Node>) -> ast::Script {
    body.iter()
        .find(|item| matches!(item.get_inner(), ast::node::Inner::Script(_)))
        .expect("Script must exist")
        .try_into()
        .expect("Cannot cast as script")
}

fn get_node_script(node: &ast::Node) -> ast::Script {
    get_body_script(&match node.get_inner() {
        ast::node::Inner::Element(el) => el.body.clone(),
        _ => vec![],
    })
}

fn compile_nested_component(node: &ast::Node, doc: &ast::Document, context: &mut Context) {
    let component =
        GetExpr::get_owner_component(&node.get_id(), doc).expect("Component must exist");

    let body: Vec<ast::Node> = match node.get_inner() {
        ast::node::Inner::Element(el) => el.body.clone(),
        _ => vec![],
    };

    let script: ast::Script = body
        .iter()
        .find(|item| matches!(item.get_inner(), ast::node::Inner::Script(_)))
        .expect("Script must exist")
        .try_into()
        .expect("Cannot cast as script");

    let script_name = script.get_name().unwrap_or("default".to_string());
    let src = script.get_src().expect("src must exist");

    let hash = format!("{:x}", crc32::checksum_ieee(src.as_bytes())).to_string();

    let assigned_name = format!("_{}.{}", hash, script_name);

    context.add_buffer(
        format!(
            "const {}{} = {}(React.forwardRef((props, ref) => {{\n",
            component.name,
            to_pascal_case(&get_node_name(node)),
            assigned_name
        )
        .as_str(),
    );
    context.start_block();

    let node: &ast::Node = node.try_into().expect("Must be node");
    context.add_buffer("return ");
    compile_node(
        &node,
        context,
        &Info::default().set_is_script_render_node(true),
    );
    context.end_block();
    context.add_buffer("\n");
    context.add_buffer("}));\n\n");
}

fn compile_imports(imports: &BTreeMap<String, Option<String>>, context: &mut Context) {
    for (path, namespace) in imports {
        if let Some(namespace) = namespace {
            context.add_buffer(
                format!(
                    "import * as {} from \"{}\";\n",
                    namespace,
                    if context.options.use_exact_imports && path.ends_with(".pc") {
                        format!("{}.js", path)
                    } else {
                        path.clone()
                    }
                )
                .as_str(),
            );
        } else {
            context.add_buffer(format!("import \"{}\";\n", path).as_str());
        }
    }
}

macro_rules! compile_children {
    ($expr: expr, $cb: expr, $context: expr, $include_ary: expr) => {{
        if $include_ary {
            $context.add_buffer("[");
        }
        $context.add_buffer("\n");
        $context.start_block();

        let mut children = $expr.into_iter().peekable();
        while let Some(child) = children.next() {
            let printed = ($cb)(child);

            if printed {
                if !children.peek().is_none() {
                    $context.add_buffer(", ");
                }

                $context.add_buffer("\n");
            }
        }

        $context.end_block();

        if $include_ary {
            $context.add_buffer("]");
        }
    }};
}

fn compile_component(component: &ast::Component, context: &mut Context) {
    context.add_buffer(format!("const _{} = (props, ref) => {{\n", &component.name).as_str());

    context.start_block();
    compile_component_render(component, &mut context.within_component(component));
    context.end_block();

    context.add_buffer("};\n");
    context.add_buffer(
        format!(
            "_{}.displayName = \"{}\";\n",
            component.name, component.name
        )
        .as_str(),
    );

    context.add_buffer(
        format!(
            "let {} = React.memo(React.forwardRef(_{}));\n",
            component.name, component.name
        )
        .as_str(),
    );

    if let Some(script) = component.get_script(COMPILER_NAME) {
        let hash = format!(
            "{:x}",
            crc32::checksum_ieee(script.get_src().expect("src must exist").as_bytes())
        )
        .to_string();

        let name = script.get_name().unwrap_or("default".to_string()).clone();

        context.add_buffer(
            format!(
                "{} = React.memo(React.forwardRef({}({})));\n",
                component.name,
                format!("_{}.{}", hash, name),
                component.name
            )
            .as_str(),
        );
    }

    if component.is_public {
        context.add_buffer(format!("export {{ {} }};\n", component.name).as_str());
    }
    context.add_buffer("\n");
}

fn compile_component_render(component: &ast::Component, context: &mut Context) {
    let render = get_or_short!(component.get_render_expr(), ());

    context.add_buffer("return ");
    compile_node(
        render.node.as_ref().expect("Node must exist"),
        context,
        &Info::default().set_is_component_render_node(true),
    );
    context.add_buffer(";\n");
}

fn compile_text_node(node: &ast::TextNode, context: &mut Context) {
    if node.is_stylable() {
        context.add_buffer("React.createElement(\"span\", { ");
        context.add_buffer("\"className\": ");
        context.add_buffer(
            format!(
                "\"{}\"",
                get_style_namespace(&node.name, &node.id, context.current_component)
            )
            .as_str(),
        );

        context.add_buffer(" }, ");
        context.add_buffer(format!("\"{}\"", node.value).as_str());
        context.add_buffer(")");
    } else {
        context.add_buffer(format!("\"{}\"", node.value).as_str());
    }
}

fn compile_slot(node: &ast::Slot, context: &mut Context) {
    context.add_buffer(format!("{}.{}", context.ctx_name, node.name).as_str());

    if node.body.len() > 0 {
        context.add_buffer(" || ");
        compile_node_children(&node.body, context, true);
    }
}

fn compile_switch(switch: &ast::Switch, context: &mut Context) {
    for item in &switch.body {
        if let ast::switch_item::Inner::Case(case) = &item.get_inner() {
            context.add_buffer("\n");
            context.add_buffer(
                format!(
                    "{}.{} === \"{}\" ? ",
                    context.ctx_name, switch.property, case.condition
                )
                .as_str(),
            );
            compile_node_children(&case.body, context, true);
            context.add_buffer(" : ");
        }
    }

    let default = switch
        .body
        .iter()
        .find(|item| matches!(item.get_inner(), ast::switch_item::Inner::Default(_)))
        .and_then(|item| Some(item.get_inner()));

    if let Some(ast::switch_item::Inner::Default(default)) = default {
        compile_node_children(&default.body, context, true);
    } else {
        context.add_buffer("null");
    }
}

fn compile_condition(condition: &ast::Condition, context: &mut Context) {
    context.add_buffer(format!("{}.{} ? ", context.ctx_name, condition.property).as_str());
    compile_node_children(&condition.body, context, true);
    context.add_buffer(" : null");
}

fn compile_repeat(repeat: &ast::Repeat, context: &mut Context) {
    let sub_name = format!("{}_{}", context.ctx_name, repeat.property);

    context.add_buffer(
        format!(
            "{}.{} && {}.{}.map({} => ",
            context.ctx_name, repeat.property, context.ctx_name, repeat.property, sub_name
        )
        .as_str(),
    );

    compile_node_children(&repeat.body, &mut context.with_ctx_name(&sub_name), true);

    context.add_buffer(")");
}

fn compile_element(element: &ast::Element, info: &Info, context: &mut Context) {
    let is_instance = context
        .dependency
        .document
        .as_ref()
        .expect("Document must exist")
        .contains_component_name(&element.tag_name)
        || element.namespace != None;

    let tag_name = if is_instance {
        let mut buffer = format!("{}", element.tag_name);
        if let Some(namespace) = &element.namespace {
            buffer = format!("{}.{}", namespace, buffer);
        }
        buffer
    } else {
        format!("\"{}\"", element.tag_name)
    };

    context.add_buffer("React.createElement(");

    if info.is_component_render_node {
        context.add_buffer("props.is || ");
    }

    context.add_buffer(format!("{}, ", tag_name).as_str());
    compile_element_parameters(element, &info.set_is_instance(is_instance), context);
    compile_element_children(element, context);
    context.add_buffer(")")
}

fn compile_element_children(element: &ast::Element, context: &mut Context) {
    let visible_children = element.get_visible_children();

    if visible_children.len() == 0 {
        return;
    }

    context.add_buffer(", ");

    compile_node_children(&element.body, context, false);
}

fn compile_node_children(children: &Vec<ast::Node>, context: &mut Context, include_ary: bool) {
    compile_children! {
      &children,
      |child: &ast::Node| {
        compile_node(child, context, &Info::default())
      },
      context,
      include_ary
    }
}

fn compile_node_script(node: &ast::Node, context: &mut Context) -> bool {
    let component = GetExpr::get_owner_component(&node.get_id(), context.dependency.get_document())
        .expect("Component must exist");

    let node_name = get_node_name(node);

    let render_script_name = format!("{}{}", component.name, to_pascal_case(&node_name));

    context.add_buffer(format!("React.createElement({}, {{\n", render_script_name).as_str());
    context.start_block();

    let inference = infer::Inferencer::new()
        .infer_node(node, &context.dependency.path, &context.graph)
        .expect("Cannot infer node");

    for (key, _) in inference {
        context.add_buffer(format!("{}: {}.{},\n", key, context.ctx_name, key).as_str());
    }

    context.end_block();
    context.add_buffer("})");

    true
}

fn compile_node(node: &ast::Node, context: &mut Context, info: &Info) -> bool {
    if node_contains_script(node) && !info.is_script_render_node {
        return compile_node_script(node, context);
    }

    match node.get_inner() {
        ast::node::Inner::Text(expr) => compile_text_node(&expr, context),
        ast::node::Inner::Element(expr) => compile_element(&expr, info, context),
        ast::node::Inner::Slot(expr) => compile_slot(&expr, context),
        ast::node::Inner::Switch(expr) => compile_switch(&expr, context),
        ast::node::Inner::Condition(expr) => compile_condition(&expr, context),
        ast::node::Inner::Repeat(expr) => compile_repeat(&expr, context),
        _ => return false,
    };
    return true;
}

fn compile_element_parameters(element: &ast::Element, info: &Info, context: &mut Context) {
    let raw_attrs = rename_attrs_for_react(
        get_raw_element_attrs(element, info, context),
        info.is_instance,
    );

    if raw_attrs.len() == 0 {
        context.add_buffer("null");
        return;
    }

    context.add_buffer("{\n");
    context.start_block();
    if let Some(name) = &element.name {
        context.add_buffer(format!("...{}.{},\n", context.ctx_name, name).as_str());
    }

    let mut attrs = raw_attrs.iter().peekable();

    while let Some((key, value)) = attrs.next() {
        context.add_buffer(format!("\"{}\": {}", key, value.get_buffer()).as_str());
        if !attrs.peek().is_none() {
            context.add_buffer(",");
        }
        context.add_buffer("\n");
    }

    context.end_block();
    context.add_buffer("}");
}

fn get_raw_element_attrs<'dependency>(
    element: &ast::Element,
    info: &Info,
    context: &mut Context<'dependency>,
) -> BTreeMap<String, Context<'dependency>> {
    let mut attrs: BTreeMap<String, Context<'dependency>> = BTreeMap::new();

    for parameter in &element.parameters {
        let mut param_context = context.with_new_content();
        compile_simple_expression(
            &parameter.value.as_ref().expect("Value must exist"),
            &mut param_context,
        );
        attrs.insert(parameter.name.to_string(), param_context);
    }

    if info.is_instance || element.is_stylable() {
        let sub = context.with_new_content();
        sub.add_buffer(
            format!(
                "\"{}\"",
                get_style_namespace(&element.name, &element.id, context.current_component)
            )
            .as_str(),
        );

        if info.is_component_render_node {
            sub.add_buffer(
                format!(" + (props.$$scopeClassName ? \" \" + props.$$scopeClassName : \"\")")
                    .as_str(),
            );
        }

        if let Some(name) = &element.name {
            let prop = format!("{}.{}", context.ctx_name, name);
            sub.add_buffer(
                format!(
                    " + ({} && {}.className ? \" \" + {}.className : \"\")",
                    prop, prop, prop
                )
                .as_str(),
            );
        }

        if info.is_instance {
            attrs.insert("$$scopeClassName".to_string(), sub);
        } else {
            if let Some(class) = attrs.get_mut("class") {
                class.add_buffer(format!(" + \" \" + {}", sub.get_buffer()).as_str());
            } else {
                attrs.insert("class".to_string(), sub);
            }
        }
    }

    for insert in &element.get_inserts() {
        let mut sub = context.with_new_content();
        compile_insert(insert, &mut sub);
        attrs.insert(insert.name.to_string(), sub);
    }

    if info.is_component_render_node || info.is_script_render_node {
        let sub = context.with_new_content();
        sub.add_buffer("ref");
        attrs.insert("ref".to_string(), sub);
    }

    let sub = context.with_new_content();
    sub.add_buffer(format!("\"{}\"", element.id).as_str());
    attrs.insert("key".to_string(), sub);

    attrs
}

fn compile_insert(insert: &ast::Insert, context: &mut Context) {
    compile_node_children(&insert.body, context, true);
}

fn rename_attrs_for_react(
    attrs: BTreeMap<String, Context>,
    is_instance: bool,
) -> BTreeMap<String, Context> {
    if is_instance {
        return attrs;
    }
    attrs
        .into_iter()
        .map(|(key, context)| (attr_alias(key.as_str()), context))
        .collect()
}

fn attr_alias(name: &str) -> String {
    (match name {
        "class" => "className",
        _ => name,
    })
    .to_string()
}

fn compile_simple_expression(expr: &ast::SimpleExpression, context: &mut Context) {
    match expr.get_inner() {
        ast::simple_expression::Inner::Str(expr) => {
            context.add_buffer(format!("\"{}\"", expr.value).as_str())
        }
        ast::simple_expression::Inner::Num(expr) => {
            context.add_buffer(format!("{}", expr.value).as_str())
        }
        ast::simple_expression::Inner::Bool(expr) => {
            context.add_buffer(format!("{}", expr.value).as_str())
        }
        ast::simple_expression::Inner::Ary(expr) => compile_array(expr, context),
        ast::simple_expression::Inner::Reference(expr) => compile_reference(expr, context),
    }
}

fn compile_reference(expr: &Reference, context: &mut Context) {
    let mut parts = expr.path.iter().peekable();

    while let Some(part) = parts.next() {
        context.add_buffer(format!("{}.{}", context.ctx_name, part).as_str());
        if !parts.peek().is_none() {
            context.add_buffer(", ");
        }
    }
}

fn compile_array(expr: &ast::Ary, context: &mut Context) {
    context.add_buffer("[");
    context.start_block();
    let mut items = expr.items.iter().peekable();
    while let Some(item) = items.next() {
        compile_simple_expression(item, context);
        if !items.peek().is_none() {
            context.add_buffer(", ");
        }
    }
    context.end_block();
    context.add_buffer("]");
}
