use super::virt;
use paperclip_common::serialize_context::Context;

pub fn serialize(document: &virt::Document) -> String {
    let mut context = Context::new(0);
    serialize_rules(&document.rules, &mut context);
    context.buffer
}

fn serialize_rules(rules: &Vec<virt::Rule>, context: &mut Context) {
    for rule in rules {
        serialize_rule(rule, context)
    }
}

fn serialize_rule(rule: &virt::Rule, context: &mut Context) {
    match rule {
        virt::Rule::Style(charset) => serialize_style_rule(charset, context),
        _ => {}
    }
}

fn serialize_style_rule(rule: &virt::StyleRule, context: &mut Context) {
    context.add_buffer(format!("{} {{\n", rule.selector_text).as_str());
    context.start_block();
    for decl in &rule.style {
        context.add_buffer(format!("{}: {};\n", decl.name, decl.value).as_str());
    }
    context.end_block();
    context.add_buffer("}\n\n");
}
