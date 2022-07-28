use super::ast;
use super::tokenizer::{is_superfluous_or_newline, Token, next_token};
use crate::base::ast as base_ast;
use crate::base::errors as err;
use crate::base::parser_context::Context;
use crate::base::string_scanner::StringScanner;
use std::str;

type PCContext<'tokenizer, 'scan, 'src> = Context<'tokenizer, 'src, Token<'src>>;

pub fn parse<'src>(
    source: &'src str,
    source_url: &String,
) -> Result<ast::Document, err::ParserError> {
    parse_with_string_scanner(&mut StringScanner::new(source), source_url)
}

pub fn parse_with_string_scanner<'src>(
    source: &'src mut StringScanner<'src>,
    source_url: &String,
) -> Result<ast::Document, err::ParserError> {
    let mut context = Context::new(source, &next_token, source_url);
    parse_document(&mut context)
}

fn parse_document(context: &mut PCContext) -> Result<ast::Document, err::ParserError> {
    let mut body: Vec<ast::DocumentBodyItem> = vec![];
    let start = context.curr_u16pos.clone();
    loop {
        context.skip(is_superfluous_or_newline);
        if context.curr_token == Token::None {
            break;
        }
        body.push(parse_document_child(context)?);
    }
    let end = context.curr_u16pos.clone();

    Ok(ast::Document {
        id: context.id_generator.new_id(),
        range: base_ast::Range::new(start, end),
        body,
    })
}

fn parse_document_child(
    context: &mut PCContext,
) -> Result<ast::DocumentBodyItem, err::ParserError> {
    match context.curr_token {
        Token::Word(b"component") => {
            Ok(ast::DocumentBodyItem::Component(parse_component(context)?))
        }
        Token::Word(b"import") => Ok(ast::DocumentBodyItem::Import(parse_import(context)?)),
        Token::Word(b"style") => Ok(ast::DocumentBodyItem::Style(parse_style(context)?)),
        _ => {
            return Err(context.new_unexpected_token_error());
        }
    }
}

fn parse_import(context: &mut PCContext) -> Result<ast::Import, err::ParserError> {
    let start = context.curr_u16pos.clone();

    // eat statement
    context.next_token();
    context.skip(is_superfluous_or_newline);

    let path = extract_string_value(context)?;

    // eat string
    context.next_token();
    context.skip(is_superfluous_or_newline);

    // eat "as"
    context.next_token();
    context.skip(is_superfluous_or_newline);
    let namespace = extract_word_value(context)?;

    // eat namespace
    context.next_token();
    context.skip(is_superfluous_or_newline);

    let end = context.curr_u16pos.clone();

    Ok(ast::Import {
        id: context.next_id(),
        path,
        namespace,
        range: base_ast::Range::new(start, end),
    })
}

fn parse_style(context: &mut PCContext) -> Result<ast::Style, err::ParserError> {
    let start = context.curr_u16pos.clone();
    context.next_token();
    context.skip(is_superfluous_or_newline);

    let body = parse_body(
        context,
        |context: &mut PCContext| {
            Ok(ast::StyleBodyItem::Declaration(parse_style_declaration(
                context,
            )?))
        },
        Some((Token::CurlyOpen, Token::CurlyClose)),
    )?;

    let end = context.curr_u16pos.clone();

    Ok(ast::Style {
        id: context.next_id(),
        body,
        range: base_ast::Range::new(start, end),
    })
}

fn parse_style_declaration(
    context: &mut PCContext,
) -> Result<ast::StyleDeclaration, err::ParserError> {
    let start = context.curr_u16pos.clone();
    let name = extract_word_value(context)?;
    context.next_token();
    context.skip(is_superfluous_or_newline);
    context.next_token(); // eat :
    context.skip(is_superfluous_or_newline);
    let value = extract_word_value(context)?;
    context.next_token();
    context.skip(is_superfluous_or_newline);

    let end = context.curr_u16pos.clone();

    Ok(ast::StyleDeclaration {
        id: context.next_id(),
        range: base_ast::Range::new(start, end),
        name,
        value,
    })
}

fn parse_component(context: &mut PCContext) -> Result<ast::Component, err::ParserError> {
    let start = context.curr_u16pos.clone();

    // eat component
    context.next_token();
    context.skip(is_superfluous_or_newline);
    let name = extract_word_value(context)?;
    // eat name
    context.next_token();
    context.skip(is_superfluous_or_newline);

    let body = parse_body(
        context,
        |context: &mut PCContext| match context.curr_token {
            Token::Word(b"render") => Ok(ast::ComponentBodyItem::Render(parse_render(context)?)),
            Token::Word(b"variant") => Ok(ast::ComponentBodyItem::Variant(parse_variant(context)?)),
            Token::Word(b"script") => Ok(ast::ComponentBodyItem::Script(parse_script(context)?)),
            _ => Err(context.new_unexpected_token_error()),
        },
        Some((Token::CurlyOpen, Token::CurlyClose)),
    )?;

    let end = context.curr_u16pos.clone();

    Ok(ast::Component {
        id: context.next_id(),
        name,
        body,
        range: base_ast::Range::new(start, end),
    })
}

fn parse_render(context: &mut PCContext) -> Result<ast::Render, err::ParserError> {
    let start = context.curr_u16pos.clone();
    context.next_token(); // eat render
    context.skip(is_superfluous_or_newline);
    let node = parse_render_node(context)?;
    let end = context.curr_u16pos.clone();

    Ok(ast::Render {
        id: context.next_id(),
        range: base_ast::Range::new(start, end),
        node,
    })
}

fn parse_variant(context: &mut PCContext) -> Result<ast::Variant, err::ParserError> {
    let start = context.curr_u16pos.clone();
    context.next_token();
    context.skip(is_superfluous_or_newline);
    let name = extract_word_value(context)?;
    context.next_token(); // eat tag name
    context.skip(is_superfluous_or_newline);
    let parameters = if context.curr_token == Token::ParenOpen {
        parse_parameters(context)?
    } else {
        vec![]
    };
    let end = context.curr_u16pos.clone();

    Ok(ast::Variant {
        id: context.next_id(),
        range: base_ast::Range::new(start, end),
        name,
        parameters,
    })
}

fn parse_script(context: &mut PCContext) -> Result<ast::Script, err::ParserError> {
    context.next_token(); // eat script
    let start = context.curr_u16pos.clone();
    let parameters = parse_parameters(context)?;
    let end = context.curr_u16pos.clone();
    Ok(ast::Script {
        id: context.next_id(),
        range: base_ast::Range::new(start, end),
        parameters,
    })
}

fn parse_render_node(context: &mut PCContext) -> Result<ast::RenderNode, err::ParserError> {
    match context.curr_token {
        Token::Word(b"text") => Ok(ast::RenderNode::Text(parse_text(context)?)),
        Token::Word(b"slot") => Ok(ast::RenderNode::Slot(parse_slot(context)?)),
        Token::Word(_) => Ok(ast::RenderNode::Element(parse_element(context)?)),
        _ => Err(context.new_unexpected_token_error()),
    }
}

fn parse_slot(context: &mut PCContext) -> Result<ast::Slot, err::ParserError> {
    let start = context.curr_u16pos.clone();
    context.next_token(); // eat keyword
    context.skip(is_superfluous_or_newline);
    let name = extract_word_value(context)?;
    context.next_token(); // eat value
    context.skip(is_superfluous_or_newline);
    let end = context.curr_u16pos.clone();
    let body = parse_body(
        context,
        |context: &mut PCContext| match context.curr_token {
            Token::Word(b"text") => Ok(ast::SlotBodyItem::Text(parse_text(context)?)),
            Token::Word(_) => Ok(ast::SlotBodyItem::Element(parse_element(context)?)),
            _ => Err(context.new_unexpected_token_error()),
        },
        Some((Token::CurlyOpen, Token::CurlyClose)),
    )?;
    context.skip(is_superfluous_or_newline);

    Ok(ast::Slot {
        id: context.next_id(),
        name,
        range: base_ast::Range::new(start, end),
        body,
    })
}

fn parse_insert(context: &mut PCContext) -> Result<ast::Insert, err::ParserError> {
    let start = context.curr_u16pos.clone();
    context.next_token(); // eat keyword
    context.skip(is_superfluous_or_newline);
    let name = extract_word_value(context)?;
    context.next_token(); // eat value
    context.skip(is_superfluous_or_newline);
    let end = context.curr_u16pos.clone();
    let body = parse_body(
        context,
        |context: &mut PCContext| match context.curr_token {
            Token::Word(b"text") => Ok(ast::InsertBody::Text(parse_text(context)?)),
            Token::Word(_) => Ok(ast::InsertBody::Element(parse_element(context)?)),
            _ => Err(context.new_unexpected_token_error()),
        },
        Some((Token::CurlyOpen, Token::CurlyClose)),
    )?;
    context.skip(is_superfluous_or_newline);

    Ok(ast::Insert {
        id: context.next_id(),
        name,
        range: base_ast::Range::new(start, end),
        body,
    })
}

fn parse_text(context: &mut PCContext) -> Result<ast::TextNode, err::ParserError> {
    let start = context.curr_u16pos.clone();
    context.next_token(); // eat render
    context.skip(is_superfluous_or_newline);
    let ref_name = parse_optional_ref_name(context)?;
    let value = extract_string_value(context)?;
    context.next_token(); // eat value
    context.skip(is_superfluous_or_newline);

    let body = if context.curr_token == Token::CurlyOpen {
        parse_body(
            context,
            |context: &mut PCContext| match context.curr_token {
                Token::Word(b"style") => Ok(ast::TextNodeBodyItem::Style(parse_style(context)?)),
                _ => Err(context.new_unexpected_token_error()),
            },
            Some((Token::CurlyOpen, Token::CurlyClose)),
        )?
    } else {
        vec![]
    };

    let end = context.curr_u16pos.clone();

    Ok(ast::TextNode {
        id: context.next_id(),
        range: base_ast::Range::new(start, end),
        name: ref_name,
        value,
        body,
    })
}

fn extract_string_value(context: &mut PCContext) -> Result<String, err::ParserError> {
    if let Token::String(value) = context.curr_token {
        Ok(trim_string(str::from_utf8(value).unwrap()))
    } else {
        return Err(context.new_unexpected_token_error());
    }
}

fn extract_word_value(context: &mut PCContext) -> Result<String, err::ParserError> {
    if let Token::Word(value) = context.curr_token {
        Ok(str::from_utf8(value).unwrap().to_string())
    } else {
        return Err(context.new_unexpected_token_error());
    }
}

fn parse_optional_ref_name(context: &mut PCContext) -> Result<Option<String>, err::ParserError> {
    if let Token::Word(_) = context.curr_token {
        let ref_name = extract_word_value(context)?;
        context.next_token();
        context.skip(is_superfluous_or_newline);
        Ok(Some(ref_name))
    } else {
        Ok(None)
    }
}

fn parse_override(context: &mut PCContext) -> Result<ast::Override, err::ParserError> {
    let start = context.curr_u16pos.clone();
    context.next_token(); // eat override
    context.skip(is_superfluous_or_newline);
    let path = if matches!(context.curr_token, Token::Word(_)) {
        parse_path(context)?
    } else {
        vec![]
    };

    context.skip(is_superfluous_or_newline);

    let body = if context.curr_token == Token::CurlyOpen {
        parse_body(
            context,
            |context: &mut PCContext| match context.curr_token {
                Token::Word(b"variant") => {
                    Ok(ast::OverrideBodyItem::Variant(parse_variant(context)?))
                }
                Token::Word(b"style") => Ok(ast::OverrideBodyItem::Style(parse_style(context)?)),
                _ => Err(context.new_unexpected_token_error()),
            },
            Some((Token::CurlyOpen, Token::CurlyClose)),
        )?
    } else {
        vec![]
    };

    let end = context.curr_u16pos.clone();

    Ok(ast::Override {
        id: context.next_id(),
        range: base_ast::Range::new(start, end),
        path,
        body,
    })
}

fn parse_element(context: &mut PCContext) -> Result<ast::Element, err::ParserError> {
    let start = context.curr_u16pos.clone();
    let tag_parts = parse_path(context)?;
    let namespace: Option<String> = if tag_parts.len() == 2 {
        Some(tag_parts.first().unwrap().clone())
    } else {
        None
    };

    let tag_name: String = tag_parts.last().unwrap().clone();

    context.skip(is_superfluous_or_newline);

    let ref_name = parse_optional_ref_name(context)?;

    let parameters = if context.curr_token == Token::ParenOpen {
        parse_parameters(context)?
    } else {
        vec![]
    };

    let body = if context.curr_token == Token::CurlyOpen {
        parse_body(
            context,
            |context: &mut PCContext| match context.curr_token {
                Token::Word(b"style") => Ok(ast::ElementBodyItem::Style(parse_style(context)?)),
                Token::Word(b"text") => Ok(ast::ElementBodyItem::Text(parse_text(context)?)),
                Token::Word(b"insert") => Ok(ast::ElementBodyItem::Insert(parse_insert(context)?)),
                Token::Word(b"override") => {
                    Ok(ast::ElementBodyItem::Override(parse_override(context)?))
                }
                Token::Word(_) => Ok(ast::ElementBodyItem::Element(parse_element(context)?)),
                _ => Err(context.new_unexpected_token_error()),
            },
            Some((Token::CurlyOpen, Token::CurlyClose)),
        )?
    } else {
        vec![]
    };

    let end = context.curr_u16pos.clone();

    Ok(ast::Element {
        id: context.next_id(),
        parameters,
        name: ref_name,
        namespace,
        tag_name,
        range: base_ast::Range::new(start, end),
        body,
    })
}

fn parse_parameters(context: &mut PCContext) -> Result<Vec<ast::Parameter>, err::ParserError> {
    context.next_token(); // eat (
    context.skip(is_superfluous_or_newline);
    let mut parameters: Vec<ast::Parameter> = vec![];

    while context.curr_token != Token::ParenClose {
        parameters.push(parse_parameter(context)?);
    }

    context.next_token(); // eat )
    context.skip(is_superfluous_or_newline);

    Ok(parameters)
}

fn parse_parameter(context: &mut PCContext) -> Result<ast::Parameter, err::ParserError> {
    let start = context.curr_u16pos.clone();
    let name = extract_word_value(context)?;
    context.next_token(); // eat name
    context.skip(is_superfluous_or_newline);
    context.next_token(); // eat :
    context.skip(is_superfluous_or_newline);
    let value = parse_simple_expression(context)?;
    let end = context.curr_u16pos.clone();

    // Since this isn't used anywhere else, we can include comma logic here
    context.skip(is_superfluous_or_newline);
    if context.curr_token == Token::Comma {
        context.next_token(); // eat
        context.skip(is_superfluous_or_newline);
    }

    Ok(ast::Parameter {
        id: context.next_id(),
        range: base_ast::Range::new(start, end),
        name,
        value,
    })
}

fn parse_simple_expression(
    context: &mut PCContext,
) -> Result<ast::SimpleExpression, err::ParserError> {
    match context.curr_token {
        Token::String(value) => Ok(ast::SimpleExpression::String(parse_string(context)?)),
        Token::Word(b"true" | b"false") => {
            Ok(ast::SimpleExpression::Boolean(parse_boolean(context)?))
        }
        Token::Word(_) => Ok(ast::SimpleExpression::Reference(parse_ref(context)?)),
        Token::SquareOpen => Ok(ast::SimpleExpression::Array(parse_array(context)?)),
        _ => return Err(context.new_unexpected_token_error()),
    }
}

fn parse_array(context: &mut PCContext) -> Result<ast::Array, err::ParserError> {
    let start = context.curr_u16pos.clone();
    context.next_token(); // eat [
    context.skip(is_superfluous_or_newline);
    let mut items: Vec<ast::SimpleExpression> = vec![];

    while context.curr_token != Token::SquareClose {
        items.push(parse_simple_expression(context)?);
    }

    context.next_token(); // eat ]
    let end = context.curr_u16pos.clone();

    Ok(ast::Array {
        id: context.next_id(),
        range: base_ast::Range::new(start, end),
        items,
    })
}

fn parse_string(context: &mut PCContext) -> Result<base_ast::Str, err::ParserError> {
    let start = context.curr_u16pos.clone();
    let value = extract_string_value(context)?;
    context.next_token();
    let end = context.curr_u16pos.clone();

    Ok(base_ast::Str {
        id: context.next_id(),
        range: base_ast::Range::new(start, end),
        value,
    })
}

fn parse_boolean(context: &mut PCContext) -> Result<ast::Boolean, err::ParserError> {
    let start = context.curr_u16pos.clone();
    let value = context.curr_token == Token::Word(b"true");
    context.next_token();
    let end = context.curr_u16pos.clone();

    Ok(ast::Boolean {
        id: context.next_id(),
        range: base_ast::Range::new(start, end),
        value,
    })
}

fn parse_ref(context: &mut PCContext) -> Result<ast::Reference, err::ParserError> {
    let start = context.curr_u16pos.clone();
    let path: Vec<String> = parse_path(context)?;
    let end = context.curr_u16pos.clone();
    Ok(ast::Reference {
        id: context.next_id(),
        range: base_ast::Range::new(start, end),
        path,
    })
}

fn parse_path(context: &mut PCContext) -> Result<Vec<String>, err::ParserError> {
    let mut path: Vec<String> = vec![extract_word_value(context)?];
    context.next_token();
    while context.curr_token == Token::Dot {
        context.next_token();
        path.push(extract_word_value(context)?);
        context.next_token();
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
        context.next_token();
        context.skip(is_superfluous_or_newline);
    }

    let mut body: Vec<TItem> = vec![];

    while context.curr_token != Token::None {
        if let Some((_, end)) = &ends {
            if &context.curr_token == end {
                context.next_token();
                context.skip(is_superfluous_or_newline);
                break;
            }
        }

        body.push(parse_item(context)?);
    }

    Ok(body)
}

fn parse_component_body(context: &mut PCContext) -> Result<ast::Component, err::ParserError> {
    let start = context.curr_u16pos.clone();

    // eat component
    context.next_token();
    context.skip(is_superfluous_or_newline);

    let name = extract_word_value(context)?;

    // eat name
    context.next_token();

    let end = context.curr_u16pos.clone();

    Ok(ast::Component {
        id: context.next_id(),
        name,
        body: vec![],
        range: base_ast::Range::new(start, end),
    })
}

fn trim_string(value: &str) -> String {
    value[1..value.len() - 1].to_string()
}
