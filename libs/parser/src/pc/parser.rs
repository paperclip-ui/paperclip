use super::tokenizer::{is_superfluous, is_superfluous_or_newline, next_token, Token};
use crate::base::ast as base_ast;
use crate::core::errors as err;
use crate::core::parser_context::{create_initial_context, Context, Options};
use crate::core::string_scanner::StringScanner;
use paperclip_proto::ast::css as css_ast;
use paperclip_proto::ast::docco as docco_ast;
use paperclip_proto::ast::pc::{self as ast, TriggerBodyItem};
use paperclip_proto::ast::shared as shared_ast;

use crate::css::parser::{
    parse_style_declaration_with_string_scanner, parse_style_declarations_with_string_scanner,
};
use crate::docco::parser::parse_with_string_scanner as parse_doc_comment;
use paperclip_common::id::IDGenerator;
use std::str;

type PCContext<'tokenizer, 'scanner, 'idgenerator, 'scan, 'src> =
    Context<'tokenizer, 'scanner, 'idgenerator, 'src, Token<'src>>;

pub fn parse<'src>(
    source: &'src str,
    id_seed: &str,
    options: &Options,
) -> Result<ast::Document, err::ParserError> {
    let (mut scanner, mut id_generator) = create_initial_context(source, id_seed);
    parse_with_context(&mut scanner, &mut id_generator, id_seed, options)
}

pub fn parse_with_context<'src>(
    source: &'src mut StringScanner<'src>,
    id_generator: &mut IDGenerator,
    id_seed: &str,
    options: &Options,
) -> Result<ast::Document, err::ParserError> {
    if source.is_eof() {
        return Ok(ast::Document {
            id: id_generator.new_id(),
            range: Some(base_ast::Range::new(
                source.get_u16pos(),
                source.get_u16pos(),
            )),
            body: vec![],
        });
    }

    let mut context = Context::new(source, id_seed, &next_token, id_generator, options.clone())?;
    parse_document(&mut context)
}

fn parse_document(context: &mut PCContext) -> Result<ast::Document, err::ParserError> {
    let mut body: Vec<ast::DocumentBodyItem> = vec![];
    let start = context.curr_u16pos.clone();
    loop {
        context.skip(is_superfluous_or_newline)?;
        if context.curr_token == None {
            break;
        }
        body.push(parse_document_child(context)?);
    }
    let end = context.curr_u16pos.clone();

    Ok(ast::Document {
        id: context.id_generator.new_id(),
        range: Some(base_ast::Range::new(start, end)),
        body,
    })
}

fn parse_document_child(
    context: &mut PCContext,
) -> Result<ast::DocumentBodyItem, err::ParserError> {
    let comment = if matches!(context.curr_token, Some(Token::DoccoStart)) {
        Some(parse_docco(context)?)
    } else {
        None
    };

    let is_public = if context.curr_token == Some(Token::KeywordPublic) {
        context.next_token()?; // eat
        context.skip(is_superfluous_or_newline)?;
        true
    } else {
        false
    };

    match context.curr_token {
        Some(Token::KeywordComponent) => Ok(ast::document_body_item::Inner::Component(
            parse_component(context, comment, is_public)?,
        )
        .get_outer()),
        Some(Token::KeywordImport) => {
            Ok(ast::document_body_item::Inner::Import(parse_import(context)?).get_outer())
        }
        Some(Token::Word(b"style")) => {
            Ok(ast::document_body_item::Inner::Style(parse_style(context, is_public)?).get_outer())
        }
        Some(Token::Word(b"token")) => {
            Ok(ast::document_body_item::Inner::Atom(parse_atom(context, is_public)?).get_outer())
        }
        Some(Token::Word(b"trigger")) => Ok(ast::document_body_item::Inner::Trigger(
            parse_trigger(context, is_public)?,
        )
        .get_outer()),
        Some(Token::Word(b"text")) => {
            Ok(ast::document_body_item::Inner::Text(parse_text(comment, context)?).get_outer())
        }
        Some(Token::Word(_)) => Ok(ast::document_body_item::Inner::Element(parse_element(
            comment, context,
        )?)
        .get_outer()),
        _ => {
            return Err(context.new_unexpected_token_error());
        }
    }
}

fn parse_atom(context: &mut PCContext, is_public: bool) -> Result<ast::Atom, err::ParserError> {
    let start = context.curr_u16pos.clone();
    context.next_token()?; // eat atom
    context.skip(is_superfluous)?;
    let name = extract_word_value(context)?;
    let value = Some(parse_style_declaration_with_string_scanner(
        context.scanner,
        context.id_generator,
        &context.id_seed,
    )?);

    context.next_token()?;
    let end = context.curr_u16pos.clone();

    Ok(ast::Atom {
        id: context.next_id(),
        range: Some(base_ast::Range::new(start, end)),
        name,
        is_public,
        value,
    })
}

fn parse_trigger(
    context: &mut PCContext,
    is_public: bool,
) -> Result<ast::Trigger, err::ParserError> {
    let start = context.curr_u16pos.clone();
    context.next_token()?; // eat trigger
    context.skip(is_superfluous)?;
    let name = extract_word_value(context)?;
    context.next_token()?;
    context.skip(is_superfluous)?;
    let body = parse_trigger_body(context)?;
    let end = context.curr_u16pos.clone();

    Ok(ast::Trigger {
        id: context.next_id(),
        name,
        range: Some(base_ast::Range::new(start, end)),
        is_public,
        body,
    })
}

fn parse_trigger_body(
    context: &mut PCContext,
) -> Result<Vec<ast::TriggerBodyItemCombo>, err::ParserError> {
    let mut body: Vec<ast::TriggerBodyItemCombo> = vec![];
    context.next_token()?; // eat {
    context.skip(is_superfluous_or_newline)?;
    while context.curr_token != Some(Token::CurlyClose) {
        body.push(parse_trigger_body_combo(context)?);
        context.skip(is_superfluous_or_newline)?;
    }
    context.next_token()?; // eat }
    Ok(body)
}

fn parse_trigger_body_combo(
    context: &mut PCContext,
) -> Result<ast::TriggerBodyItemCombo, err::ParserError> {
    let start = context.curr_u16pos.clone();

    let mut items: Vec<TriggerBodyItem> = vec![];

    loop {
        let item = parse_trigger_body_item(context)?;
        context.skip(is_superfluous_or_newline)?;
        items.push(item);

        if matches!(context.curr_token, Some(Token::Plus)) {
            // eat token
            context.next_token()?;
            context.skip(is_superfluous_or_newline)?;
        } else {
            break;
        }
    }
    let end = context.curr_u16pos.clone();

    Ok(ast::TriggerBodyItemCombo {
        id: context.next_id(),
        range: Some(base_ast::Range::new(start, end)),
        items,
    })
}

fn parse_trigger_body_item(
    context: &mut PCContext,
) -> Result<ast::TriggerBodyItem, err::ParserError> {
    match &context.curr_token {
        Some(Token::String(_)) => {
            Ok(ast::trigger_body_item::Inner::Str(parse_string(context)?).get_outer())
        }
        Some(Token::Word(b"true")) | Some(Token::Word(b"false")) => {
            Ok(ast::trigger_body_item::Inner::Bool(parse_boolean(context)?).get_outer())
        }
        Some(Token::Word(_)) => {
            Ok(ast::trigger_body_item::Inner::Reference(parse_ref(context)?).get_outer())
        }
        _ => Err(context.new_unexpected_token_error()),
    }
}

fn parse_docco(context: &mut PCContext) -> Result<docco_ast::Comment, err::ParserError> {
    let ret = parse_doc_comment(
        &mut context.scanner,
        &mut context.id_generator,
        &context.id_seed,
    );
    context.next_token()?;
    ret
}

fn parse_import(context: &mut PCContext) -> Result<ast::Import, err::ParserError> {
    let start = context.curr_u16pos.clone();

    // eat statement
    context.next_token()?;
    context.skip(is_superfluous_or_newline)?;

    let path = extract_string_value(context)?;

    // eat string
    context.next_token()?;
    context.skip(is_superfluous_or_newline)?;

    // eat "as"
    context.next_token()?;
    context.skip(is_superfluous_or_newline)?;
    let namespace = extract_word_value(context)?;

    // eat namespace
    context.next_token()?;
    context.skip(is_superfluous_or_newline)?;

    let end = context.curr_u16pos.clone();

    Ok(ast::Import {
        id: context.next_id(),
        path,
        namespace,
        range: Some(base_ast::Range::new(start, end)),
    })
}

fn parse_style(context: &mut PCContext, is_public: bool) -> Result<ast::Style, err::ParserError> {
    let start = context.curr_u16pos.clone();
    context.next_token()?; // eat style
    context.skip(is_superfluous)?;

    let name = if let Some(Token::Word(name)) = context.curr_token {
        context.next_token()?;
        context.skip(is_superfluous_or_newline)?;
        Some(str::from_utf8(name).unwrap().to_string())
    } else {
        None
    };

    let variant_combo = if context.curr_token == Some(Token::KeywordVariant) {
        context.next_token()?; // eat keyword
        context.skip(is_superfluous)?;
        parse_list(context, parse_ref, Token::Plus)?
    } else {
        vec![]
    };

    context.skip(is_superfluous)?;

    let extends = if context.curr_token == Some(Token::KeywordExtends) {
        parse_style_extends(context)?
    } else {
        vec![]
    };

    context.skip(is_superfluous)?;

    // enable styles to be created without bodies
    let declarations: Vec<css_ast::StyleDeclaration> =
        if context.curr_token == Some(Token::CurlyOpen) {
            // set position to {
            let ret = parse_style_declarations_with_string_scanner(
                context.scanner,
                context.id_generator,
                &context.id_seed,
            )?;

            context.next_token()?; // eat }

            ret
        } else {
            vec![]
        };

    context.skip(is_superfluous_or_newline)?;

    let end = context.curr_u16pos.clone();

    Ok(ast::Style {
        id: context.next_id(),
        is_public,
        variant_combo,
        name,
        extends,
        declarations,
        range: Some(base_ast::Range::new(start, end)),
    })
}

fn parse_style_extends(
    context: &mut PCContext,
) -> Result<Vec<shared_ast::Reference>, err::ParserError> {
    context.next_token()?; // eat
    context.skip(is_superfluous_or_newline)?;

    let mut extends: Vec<shared_ast::Reference> = vec![];
    loop {
        extends.push(parse_ref(context)?);
        context.skip(is_superfluous_or_newline)?;
        if context.curr_token != Some(Token::Comma) {
            break;
        }
        context.next_token()?;
        context.skip(is_superfluous_or_newline)?;
    }

    Ok(extends)
}

fn parse_component(
    context: &mut PCContext,
    comment: Option<docco_ast::Comment>,
    is_public: bool,
) -> Result<ast::Component, err::ParserError> {
    let start = context.curr_u16pos.clone();

    // eat component
    context.next_token()?;
    context.skip(is_superfluous_or_newline)?;
    let name = extract_word_value(context)?;
    // eat name
    context.next_token()?;
    context.skip(is_superfluous_or_newline)?;

    let body = parse_body(
        context,
        |context: &mut PCContext| match context.curr_token {
            Some(Token::Word(b"render")) => {
                Ok(ast::component_body_item::Inner::Render(parse_render(context)?).get_outer())
            }
            Some(Token::KeywordVariant) => {
                Ok(ast::component_body_item::Inner::Variant(parse_variant(context)?).get_outer())
            }
            Some(Token::Word(b"script")) => {
                Ok(ast::component_body_item::Inner::Script(parse_script(context)?).get_outer())
            }
            _ => Err(context.new_unexpected_token_error()),
        },
        Some((Token::CurlyOpen, Token::CurlyClose)),
    )?;

    let end = context.curr_u16pos.clone();

    Ok(ast::Component {
        id: context.next_id(),
        is_public,
        name,
        body,
        comment,
        range: Some(base_ast::Range::new(start, end)),
    })
}

fn parse_render(context: &mut PCContext) -> Result<ast::Render, err::ParserError> {
    let start = context.curr_u16pos.clone();
    context.next_token()?; // eat render
    context.skip(is_superfluous)?;
    let node = Some(parse_render_node(context)?);
    let end = context.curr_u16pos.clone();

    Ok(ast::Render {
        id: context.next_id(),
        range: Some(base_ast::Range::new(start, end)),
        node,
    })
}

pub fn parse_variant(context: &mut PCContext) -> Result<ast::Variant, err::ParserError> {
    let start = context.curr_u16pos.clone();
    context.next_token()?;
    context.skip(is_superfluous_or_newline)?;
    let name = extract_word_value(context)?;
    context.next_token()?; // eat tag name
    context.skip(is_superfluous_or_newline)?;
    let triggers = if context.curr_token == Some(Token::Word(b"trigger")) {
        context.next_token()?;
        context.skip(is_superfluous)?;

        parse_trigger_body(context)?
    } else {
        vec![]
    };

    let end = context.curr_u16pos.clone();
    context.skip(is_superfluous_or_newline)?;

    Ok(ast::Variant {
        id: context.next_id(),
        range: Some(base_ast::Range::new(start, end)),
        name,
        triggers,
    })
}

fn parse_script(context: &mut PCContext) -> Result<ast::Script, err::ParserError> {
    context.next_token()?; // eat script
    context.skip(is_superfluous_or_newline)?;
    let start = context.curr_u16pos.clone();
    let parameters = parse_parameters(context)?;
    let end = context.curr_u16pos.clone();

    let range = base_ast::Range::new(start, end);

    if !context.options.feature_enabled("script") {
        return Err(err::ParserError::new_feature_not_enabled("script", &range));
    }

    Ok(ast::Script {
        id: context.next_id(),
        range: Some(range),
        parameters,
    })
}

fn parse_list<TItem, TParseItem>(
    context: &mut PCContext,
    parse_item: TParseItem,
    delim: Token,
) -> Result<Vec<TItem>, err::ParserError>
where
    TParseItem: Fn(&mut PCContext) -> Result<TItem, err::ParserError>,
{
    let mut items = vec![];
    loop {
        items.push(parse_item(context)?);
        context.skip(is_superfluous)?;
        if context.curr_token == Some(delim) {
            context.next_token()?; // eat ,
            context.skip(is_superfluous_or_newline)?;
        } else {
            break;
        }
    }

    Ok(items)
}

fn parse_render_node(context: &mut PCContext) -> Result<ast::Node, err::ParserError> {
    match context.curr_token {
        Some(Token::Word(b"text")) => {
            Ok(ast::node::Inner::Text(parse_text(None, context)?).get_outer())
        }
        Some(Token::Word(b"slot")) => Ok(ast::node::Inner::Slot(parse_slot(context)?).get_outer()),
        Some(Token::Word(b"repeat")) => {
            Ok(ast::node::Inner::Repeat(parse_repeat(context)?).get_outer())
        }
        Some(Token::Word(b"switch")) => {
            Ok(ast::node::Inner::Switch(parse_switch(context)?).get_outer())
        }
        Some(Token::Word(b"condition")) => {
            Ok(ast::node::Inner::Condition(parse_condition(context)?).get_outer())
        }
        Some(Token::Word(_)) => {
            Ok(ast::node::Inner::Element(parse_element(None, context)?).get_outer())
        }
        _ => Err(context.new_unexpected_token_error()),
    }
}

fn parse_slot(context: &mut PCContext) -> Result<ast::Slot, err::ParserError> {
    let start = context.curr_u16pos.clone();
    context.next_token()?; // eat keyword
    context.skip(is_superfluous_or_newline)?;
    let name = extract_word_value(context)?;
    context.next_token()?; // eat value
    context.skip(is_superfluous_or_newline)?;
    let end = context.curr_u16pos.clone();

    let body = if context.curr_token == Some(Token::CurlyOpen) {
        parse_body(
            context,
            |context: &mut PCContext| match context.curr_token {
                Some(Token::Word(b"text")) => {
                    Ok(ast::node::Inner::Text(parse_text(None, context)?).get_outer())
                }
                Some(Token::Word(b"if")) => {
                    Ok(ast::node::Inner::Condition(parse_condition(context)?).get_outer())
                }
                Some(Token::Word(b"repeat")) => {
                    Ok(ast::node::Inner::Repeat(parse_repeat(context)?).get_outer())
                }
                Some(Token::Word(_)) => {
                    Ok(ast::node::Inner::Element(parse_element(None, context)?).get_outer())
                }
                _ => Err(context.new_unexpected_token_error()),
            },
            Some((Token::CurlyOpen, Token::CurlyClose)),
        )?
    } else {
        vec![]
    };

    context.skip(is_superfluous_or_newline)?;

    Ok(ast::Slot {
        id: context.next_id(),
        name,
        range: Some(base_ast::Range::new(start, end)),
        body,
    })
}

fn parse_condition(context: &mut PCContext) -> Result<ast::Condition, err::ParserError> {
    let start = context.curr_u16pos.clone();

    context.next_token()?; // eat "if"

    context.skip(is_superfluous_or_newline)?;
    let property = extract_word_value(context)?;
    context.next_token()?; // eat word
    context.skip(is_superfluous_or_newline)?;
    let body = parse_body(
        context,
        parse_node,
        Some((Token::CurlyOpen, Token::CurlyClose)),
    )?;

    let end = context.curr_u16pos.clone();
    let range = base_ast::Range::new(start, end);

    if !context.options.feature_enabled("condition") {
        return Err(err::ParserError::new_feature_not_enabled(
            "condition",
            &range,
        ));
    }

    Ok(ast::Condition {
        id: context.next_id(),
        range: Some(range),
        property,
        body,
    })
}

fn parse_repeat(context: &mut PCContext) -> Result<ast::Repeat, err::ParserError> {
    let start = context.curr_u16pos.clone();

    context.next_token()?; // eat repeat

    context.skip(is_superfluous_or_newline)?;
    let property = extract_word_value(context)?;
    context.next_token()?; // eat word
    context.skip(is_superfluous_or_newline)?;
    let body = parse_body(
        context,
        parse_node,
        Some((Token::CurlyOpen, Token::CurlyClose)),
    )?;

    let end = context.curr_u16pos.clone();
    let range = base_ast::Range::new(start, end);

    if !context.options.feature_enabled("repeat") {
        return Err(err::ParserError::new_feature_not_enabled("repeat", &range));
    }

    Ok(ast::Repeat {
        id: context.next_id(),
        range: Some(range),
        property,
        body,
    })
}

fn parse_switch(context: &mut PCContext) -> Result<ast::Switch, err::ParserError> {
    let start = context.curr_u16pos.clone();
    context.next_token()?;
    // each switch
    context.skip(is_superfluous_or_newline)?;
    let property = extract_word_value(context)?;
    context.next_token()?; // eat word
    context.skip(is_superfluous_or_newline)?;
    let body = parse_body(
        context,
        |context| match context.curr_token {
            Some(Token::Word(b"case")) => {
                Ok(ast::switch_item::Inner::Case(parse_switch_case(context)?).get_outer())
            }
            Some(Token::Word(b"default")) => {
                Ok(ast::switch_item::Inner::Default(parse_switch_default(context)?).get_outer())
            }
            _ => Err(context.new_unexpected_token_error()),
        },
        Some((Token::CurlyOpen, Token::CurlyClose)),
    )?;
    let end = context.curr_u16pos.clone();

    let range = base_ast::Range::new(start, end);

    if !context.options.feature_enabled("switch") {
        return Err(err::ParserError::new_feature_not_enabled("switch", &range));
    }

    Ok(ast::Switch {
        id: context.id_generator.new_id(),
        range: Some(range),
        property,
        body,
    })
}

fn parse_switch_case(context: &mut PCContext) -> Result<ast::SwitchCase, err::ParserError> {
    let start = context.curr_u16pos.clone();
    context.next_token()?; // eat case
    context.skip(is_superfluous_or_newline)?; // ws
    let condition = extract_string_value(context)?;
    context.next_token()?; // eat word
    context.skip(is_superfluous_or_newline)?;
    let body = parse_body(
        context,
        parse_node,
        Some((Token::CurlyOpen, Token::CurlyClose)),
    )?;
    let end = context.curr_u16pos.clone();

    Ok(ast::SwitchCase {
        id: context.id_generator.new_id(),
        range: Some(base_ast::Range::new(start, end)),
        condition,
        body,
    })
}

fn parse_switch_default(context: &mut PCContext) -> Result<ast::SwitchDefault, err::ParserError> {
    let start = context.curr_u16pos.clone();
    context.next_token()?; // eat default
    context.skip(is_superfluous_or_newline)?;
    let body = parse_body(
        context,
        parse_node,
        Some((Token::CurlyOpen, Token::CurlyClose)),
    )?;
    let end = context.curr_u16pos.clone();

    Ok(ast::SwitchDefault {
        id: context.id_generator.new_id(),
        range: Some(base_ast::Range::new(start, end)),
        body,
    })
}

fn parse_insert(context: &mut PCContext) -> Result<ast::Insert, err::ParserError> {
    let start = context.curr_u16pos.clone();
    context.next_token()?; // eat keyword
    context.skip(is_superfluous_or_newline)?;
    let name = extract_word_value(context)?;
    context.next_token()?; // eat value
    context.skip(is_superfluous)?;
    let end = context.curr_u16pos.clone();
    let body = parse_body(
        context,
        |context: &mut PCContext| match context.curr_token {
            Some(Token::Word(b"text")) => {
                Ok(ast::node::Inner::Text(parse_text(None, context)?).get_outer())
            }
            Some(Token::Word(b"slot")) => {
                Ok(ast::node::Inner::Slot(parse_slot(context)?).get_outer())
            }
            Some(Token::Word(b"if")) => {
                Ok(ast::node::Inner::Condition(parse_condition(context)?).get_outer())
            }
            Some(Token::Word(b"repeat")) => {
                Ok(ast::node::Inner::Repeat(parse_repeat(context)?).get_outer())
            }
            Some(Token::Word(_)) => {
                Ok(ast::node::Inner::Element(parse_element(None, context)?).get_outer())
            }
            _ => Err(context.new_unexpected_token_error()),
        },
        Some((Token::CurlyOpen, Token::CurlyClose)),
    )?;
    context.skip(is_superfluous_or_newline)?;

    Ok(ast::Insert {
        id: context.next_id(),
        name,
        range: Some(base_ast::Range::new(start, end)),
        body,
    })
}

fn parse_text(
    comment: Option<docco_ast::Comment>,
    context: &mut PCContext,
) -> Result<ast::TextNode, err::ParserError> {
    let start = context.curr_u16pos.clone();
    context.next_token()?; // eat render
    context.skip(is_superfluous_or_newline)?;
    let ref_name = parse_optional_ref_name(context)?;
    context.skip(is_superfluous_or_newline)?;
    let value = if let Some(Token::String(value)) = context.curr_token {
        context.next_token()?; // eat value
        trim_string(str::from_utf8(value).unwrap())
    } else {
        return Err(context.new_unexpected_token_error());
    };
    context.skip(is_superfluous_or_newline)?;

    let body = if context.curr_token == Some(Token::CurlyOpen) {
        parse_body(
            context,
            |context: &mut PCContext| match context.curr_token {
                Some(Token::Word(b"style")) => {
                    Ok(ast::node::Inner::Style(parse_style(context, false)?).get_outer())
                }
                Some(Token::Word(b"script")) => {
                    Ok(ast::node::Inner::Script(parse_script(context)?).get_outer())
                }
                _ => Err(context.new_unexpected_token_error()),
            },
            Some((Token::CurlyOpen, Token::CurlyClose)),
        )?
    } else {
        vec![]
    };
    context.skip(is_superfluous_or_newline)?;

    let end = context.curr_u16pos.clone();

    Ok(ast::TextNode {
        id: context.next_id(),
        range: Some(base_ast::Range::new(start, end)),
        name: ref_name,
        value,
        comment,
        body,
    })
}

fn extract_string_value(context: &mut PCContext) -> Result<String, err::ParserError> {
    if let Some(Token::String(value)) = context.curr_token {
        Ok(trim_string(str::from_utf8(value).unwrap()))
    } else {
        return Err(context.new_unexpected_token_error());
    }
}

fn extract_word_value(context: &mut PCContext) -> Result<String, err::ParserError> {
    if let Some(Token::Word(value)) = context.curr_token {
        Ok(str::from_utf8(value).unwrap().to_string())
    } else {
        return Err(context.new_unexpected_token_error());
    }
}

fn parse_optional_ref_name(context: &mut PCContext) -> Result<Option<String>, err::ParserError> {
    if let Some(Token::Word(_)) = context.curr_token {
        let ref_name = extract_word_value(context)?;
        context.next_token()?;
        context.skip(is_superfluous_or_newline)?;
        Ok(Some(ref_name))
    } else {
        Ok(None)
    }
}

fn parse_override(context: &mut PCContext) -> Result<ast::Override, err::ParserError> {
    let start = context.curr_u16pos.clone();
    context.next_token()?; // eat override
    context.skip(is_superfluous_or_newline)?;
    let path = if matches!(context.curr_token, Some(Token::Word(_))) {
        parse_path(context)?
    } else {
        vec![]
    };

    context.skip(is_superfluous_or_newline)?;

    let body = if context.curr_token == Some(Token::CurlyOpen) {
        parse_body(
            context,
            |context: &mut PCContext| match context.curr_token {
                Some(Token::KeywordVariant) => Ok(ast::override_body_item::Inner::Variant(
                    parse_variant(context)?,
                )
                .get_outer()),
                Some(Token::Word(b"style")) => Ok(ast::override_body_item::Inner::Style(
                    parse_style(context, false)?,
                )
                .get_outer()),
                _ => Err(context.new_unexpected_token_error()),
            },
            Some((Token::CurlyOpen, Token::CurlyClose)),
        )?
    } else {
        vec![]
    };

    let end = context.curr_u16pos.clone();
    let range = base_ast::Range::new(start, end);

    if !context.options.feature_enabled("styleOverride") {
        return Err(err::ParserError::new_feature_not_enabled(
            "styleOverride",
            &range,
        ));
    }

    Ok(ast::Override {
        id: context.next_id(),
        range: Some(range),
        path,
        body,
    })
}

fn parse_node(context: &mut PCContext) -> Result<ast::Node, err::ParserError> {
    match context.curr_token {
        Some(Token::Word(b"style")) => {
            Ok(ast::node::Inner::Style(parse_style(context, false)?).get_outer())
        }
        Some(Token::Word(b"text")) => {
            Ok(ast::node::Inner::Text(parse_text(None, context)?).get_outer())
        }
        Some(Token::Word(b"insert")) => {
            Ok(ast::node::Inner::Insert(parse_insert(context)?).get_outer())
        }
        Some(Token::Word(b"repeat")) => {
            Ok(ast::node::Inner::Repeat(parse_repeat(context)?).get_outer())
        }
        Some(Token::Word(b"switch")) => {
            Ok(ast::node::Inner::Switch(parse_switch(context)?).get_outer())
        }
        Some(Token::Word(b"if")) => {
            Ok(ast::node::Inner::Condition(parse_condition(context)?).get_outer())
        }
        Some(Token::Word(b"script")) => {
            Ok(ast::node::Inner::Script(parse_script(context)?).get_outer())
        }
        Some(Token::Word(b"slot")) => Ok(ast::node::Inner::Slot(parse_slot(context)?).get_outer()),
        Some(Token::Word(b"override")) => {
            Ok(ast::node::Inner::Override(parse_override(context)?).get_outer())
        }
        Some(Token::Word(_)) => {
            Ok(ast::node::Inner::Element(parse_element(None, context)?).get_outer())
        }
        _ => Err(context.new_unexpected_token_error()),
    }
}

fn parse_element(
    comment: Option<docco_ast::Comment>,
    context: &mut PCContext,
) -> Result<ast::Element, err::ParserError> {
    let start = context.curr_u16pos.clone();
    let tag_parts = parse_path(context)?;
    let namespace: Option<String> = if tag_parts.len() == 2 {
        Some(tag_parts.first().unwrap().clone())
    } else {
        None
    };

    let tag_name: String = tag_parts.last().unwrap().clone();

    context.skip(is_superfluous)?;

    let ref_name = parse_optional_ref_name(context)?;

    let parameters = if context.curr_token == Some(Token::ParenOpen) {
        parse_parameters(context)?
    } else {
        vec![]
    };

    let body = if context.curr_token == Some(Token::CurlyOpen) {
        parse_body(
            context,
            |context: &mut PCContext| parse_node(context),
            Some((Token::CurlyOpen, Token::CurlyClose)),
        )?
    } else {
        vec![]
    };

    context.skip(is_superfluous_or_newline)?;

    let end = context.curr_u16pos.clone();

    Ok(ast::Element {
        id: context.next_id(),
        parameters,
        name: ref_name,
        comment,
        namespace,
        tag_name,
        range: Some(base_ast::Range::new(start, end)),
        body,
    })
}

fn parse_parameters(context: &mut PCContext) -> Result<Vec<ast::Parameter>, err::ParserError> {
    context.next_token()?; // eat (
    context.skip(is_superfluous_or_newline)?;
    let mut parameters: Vec<ast::Parameter> = vec![];

    while context.curr_token != Some(Token::ParenClose) {
        parameters.push(parse_parameter(context)?);
    }

    context.next_token()?; // eat )
    context.skip(is_superfluous_or_newline)?;

    Ok(parameters)
}

fn parse_parameter(context: &mut PCContext) -> Result<ast::Parameter, err::ParserError> {
    let start = context.curr_u16pos.clone();
    let name = extract_word_value(context)?;
    context.next_token()?; // eat name
    context.skip(is_superfluous_or_newline)?;
    context.next_token()?; // eat :
    context.skip(is_superfluous_or_newline)?;
    let value = Some(parse_simple_expression(context)?);
    let end = context.curr_u16pos.clone();

    // Since this isn't used anywhere else, we can include comma logic here
    context.skip(is_superfluous_or_newline)?;
    if context.curr_token == Some(Token::Comma) {
        context.next_token()?; // eat
        context.skip(is_superfluous_or_newline)?;
    }

    Ok(ast::Parameter {
        id: context.next_id(),
        range: Some(base_ast::Range::new(start, end)),
        name,
        value,
    })
}

fn parse_simple_expression(
    context: &mut PCContext,
) -> Result<ast::SimpleExpression, err::ParserError> {
    match context.curr_token {
        Some(Token::String(_)) => {
            Ok(ast::simple_expression::Inner::Str(parse_string(context)?).get_outer())
        }
        Some(Token::Word(b"true" | b"false")) => {
            Ok(ast::simple_expression::Inner::Bool(parse_boolean(context)?).get_outer())
        }
        Some(Token::Word(_)) => {
            Ok(ast::simple_expression::Inner::Reference(parse_ref(context)?).get_outer())
        }
        Some(Token::SquareOpen) => {
            Ok(ast::simple_expression::Inner::Ary(parse_array(context)?).get_outer())
        }
        _ => return Err(context.new_unexpected_token_error()),
    }
}

fn parse_array(context: &mut PCContext) -> Result<ast::Ary, err::ParserError> {
    let start = context.curr_u16pos.clone();
    context.next_token()?; // eat [
    context.skip(is_superfluous_or_newline)?;

    let items = if context.curr_token != Some(Token::SquareClose) {
        parse_list(context, parse_simple_expression, Token::Comma)?
    } else {
        vec![]
    };

    context.next_token()?; // eat ]
    let end = context.curr_u16pos.clone();

    Ok(ast::Ary {
        id: context.next_id(),
        range: Some(base_ast::Range::new(start, end)),
        items,
    })
}

fn parse_string(context: &mut PCContext) -> Result<base_ast::Str, err::ParserError> {
    let start = context.curr_u16pos.clone();
    let value = extract_string_value(context)?;
    context.next_token()?;
    let end = context.curr_u16pos.clone();

    Ok(base_ast::Str {
        id: context.next_id(),
        range: Some(base_ast::Range::new(start, end)),
        value,
    })
}

fn parse_boolean(context: &mut PCContext) -> Result<base_ast::Bool, err::ParserError> {
    let start = context.curr_u16pos.clone();
    let value = context.curr_token == Some(Token::Word(b"true"));
    context.next_token()?;
    let end = context.curr_u16pos.clone();

    Ok(base_ast::Bool {
        id: context.next_id(),
        range: Some(base_ast::Range::new(start, end)),
        value,
    })
}

fn parse_ref(context: &mut PCContext) -> Result<shared_ast::Reference, err::ParserError> {
    let start = context.curr_u16pos.clone();
    let path: Vec<String> = parse_path(context)?;
    let end = context.curr_u16pos.clone();
    Ok(shared_ast::Reference {
        id: context.next_id(),
        range: Some(base_ast::Range::new(start, end)),
        path,
    })
}

fn parse_path(context: &mut PCContext) -> Result<Vec<String>, err::ParserError> {
    let mut path: Vec<String> = vec![extract_word_value(context)?];
    context.next_token()?;
    while context.curr_token == Some(Token::Dot) {
        context.next_token()?;
        path.push(extract_word_value(context)?);
        context.next_token()?;
    }
    Ok(path)
}

fn parse_body<TItem, TTest>(
    context: &mut PCContext,
    parse_item: TTest,
    ends: Option<(Token, Token)>,
) -> Result<Vec<TItem>, err::ParserError>
where
    TTest: Fn(&mut PCContext) -> Result<TItem, err::ParserError>,
{
    if ends != None {
        context.next_token()?;
        context.skip(is_superfluous_or_newline)?;
    }

    let mut body: Vec<TItem> = vec![];

    while context.curr_token != None {
        if let Some((_, end)) = &ends {
            if let Some(curr) = &context.curr_token {
                if curr == end {
                    context.next_token()?;
                    context.skip(is_superfluous_or_newline)?;
                    break;
                }
            }
        }

        body.push(parse_item(context)?);
    }

    Ok(body)
}

fn trim_string(value: &str) -> String {
    value[1..value.len() - 1].to_string()
}
