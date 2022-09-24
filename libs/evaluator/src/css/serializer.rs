use super::virt;
use paperclip_common::serialize_context::Context;

pub fn serialize(document: &virt::Document) -> String {
    let mut context = Context::new(0);
    serialize_rules(&document.rules, &mut context);
    context.buffer
}

fn serialize_rules(rules: &Vec<virt::Rule>, context: &mut Context) {
    for rule in rules {
        serialize_rule(rule, context);
        context.add_buffer("\n");
    }
}

fn serialize_rule(rule: &virt::Rule, context: &mut Context) {
    match rule.get_inner() {
        virt::rule::Inner::Style(rule) => serialize_style_rule(&rule, context),
        virt::rule::Inner::Media(rule) => serialize_condition_rule(&rule, context),
        virt::rule::Inner::Supports(rule) => serialize_condition_rule(&rule, context),
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
    context.add_buffer("}\n");
}

fn serialize_condition_rule(rule: &virt::ConditionRule, context: &mut Context) {
    context.add_buffer(format!("@{} {} {{\n", rule.name, rule.condition_text).as_str());
    context.start_block();
    for rule in &rule.rules {
        serialize_rule(rule, context);
    }
    context.end_block();
    context.add_buffer("}\n");
}
