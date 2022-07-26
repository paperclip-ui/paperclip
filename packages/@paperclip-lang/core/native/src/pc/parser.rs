use super::ast;
use super::errors as err;
use super::parser_context::Context;
use super::tokenizer::{is_superfluous_or_newline, Token};
use crate::base::ast::Range;
use crate::base::string_scanner::StringScanner;
use std::str;

pub fn parse<'src>(
    source: &'src str,
    source_url: &String,
) -> Result<ast::Document, err::ParserError> {
    parse_with_string_scanner(&mut StringScanner::new(source), source_url)
}

pub fn parse_with_string_scanner<'src>(
    source: &mut StringScanner<'src>,
    source_url: &String,
) -> Result<ast::Document, err::ParserError> {
    let mut context = Context::new(source, source_url);
    parse_document(&mut context)
}

fn parse_document(context: &mut Context) -> Result<ast::Document, err::ParserError> {
    let mut body: Vec<ast::DocumentBodyItem> = vec![];
    let start = context.curr_u16pos();
    loop {
        context.skip(is_superfluous_or_newline);
        if context.curr_token() == &Token::None {
            break;
        }
        body.push(parse_document_child(context)?);
    }
    let end = context.curr_u16pos();

    Ok(ast::Document {
        id: context.id_generator.new_id(),
        range: Range::new(start, end),
        body,
    })
}

fn parse_document_child(context: &mut Context) -> Result<ast::DocumentBodyItem, err::ParserError> {
    match context.curr_token() {
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

fn parse_import(context: &mut Context) -> Result<ast::Import, err::ParserError> {
    let start = context.curr_u16pos();

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

    let end = context.curr_u16pos();

    Ok(ast::Import {
        id: context.next_id(),
        path,
        namespace,
        range: Range::new(start, end),
    })
}

fn parse_style(context: &mut Context) -> Result<ast::Style, err::ParserError> {
    let start = context.curr_u16pos();
    context.next_token();
    context.skip(is_superfluous_or_newline);

    let body = parse_body(
        context,
        |context: &mut Context| {
            Ok(ast::StyleBodyItem::Declaration(parse_style_declaration(
                context,
            )?))
        },
        Some((Token::CurlyOpen, Token::CurlyClose)),
    )?;

    let end = context.curr_u16pos();

    Ok(ast::Style {
        id: context.next_id(),
        body,
        range: Range::new(start, end),
    })
}

fn parse_style_declaration(
    context: &mut Context,
) -> Result<ast::StyleDeclaration, err::ParserError> {
    let start = context.curr_u16pos();
    let name = extract_word_value(context)?;
    context.next_token();
    context.skip(is_superfluous_or_newline);
    context.next_token(); // eat :
    context.skip(is_superfluous_or_newline);
    let value = extract_word_value(context)?;
    context.next_token();
    context.skip(is_superfluous_or_newline);

    let end = context.curr_u16pos();

    Ok(ast::StyleDeclaration {
        id: context.next_id(),
        range: Range::new(start, end),
        name,
        value,
    })
}

fn parse_component(context: &mut Context) -> Result<ast::Component, err::ParserError> {
    let start = context.curr_u16pos();

    // eat component
    context.next_token();
    context.skip(is_superfluous_or_newline);
    let name = extract_word_value(context)?;
    // eat name
    context.next_token();
    context.skip(is_superfluous_or_newline);

    let body = parse_body(
        context,
        |context: &mut Context| match context.curr_token() {
            Token::Word(b"render") => Ok(ast::ComponentBodyItem::Render(parse_render(context)?)),
            Token::Word(b"variant") => Ok(ast::ComponentBodyItem::Variant(parse_variant(context)?)),
            Token::Word(b"script") => Ok(ast::ComponentBodyItem::Script(parse_script(context)?)),
            _ => Err(context.new_unexpected_token_error()),
        },
        Some((Token::CurlyOpen, Token::CurlyClose)),
    )?;

    let end = context.curr_u16pos();

    Ok(ast::Component {
        id: context.next_id(),
        name,
        body,
        range: Range::new(start, end),
    })
}

fn parse_render(context: &mut Context) -> Result<ast::Render, err::ParserError> {
    let start = context.curr_u16pos();
    context.next_token(); // eat render
    context.skip(is_superfluous_or_newline);
    let node = parse_render_node(context)?;
    let end = context.curr_u16pos();

    Ok(ast::Render {
        id: context.next_id(),
        range: Range::new(start, end),
        node,
    })
}

fn parse_variant(context: &mut Context) -> Result<ast::Variant, err::ParserError> {
    let start = context.curr_u16pos();
    context.next_token();
    context.skip(is_superfluous_or_newline);
    let name = extract_word_value(context)?;
    context.next_token(); // eat tag name
    context.skip(is_superfluous_or_newline);
    let parameters = if context.curr_token() == &Token::ParenOpen {
        parse_parameters(context)?
    } else {
        vec![]
    };
    let end = context.curr_u16pos();

    Ok(ast::Variant {
        id: context.next_id(),
        range: Range::new(start, end),
        name,
        parameters,
    })
}

fn parse_script(context: &mut Context) -> Result<ast::Script, err::ParserError> {
    context.next_token(); // eat script
    let start = context.curr_u16pos();
    let parameters = parse_parameters(context)?;
    let end = context.curr_u16pos();
    Ok(ast::Script {
        id: context.next_id(),
        range: Range::new(start, end),
        parameters,
    })
}

fn parse_render_node(context: &mut Context) -> Result<ast::RenderNode, err::ParserError> {
    match context.curr_token() {
        Token::Word(b"text") => Ok(ast::RenderNode::Text(parse_text(context)?)),
        Token::Word(b"slot") => Ok(ast::RenderNode::Slot(parse_slot(context)?)),
        Token::Word(_) => Ok(ast::RenderNode::Element(parse_element(context)?)),
        _ => Err(context.new_unexpected_token_error()),
    }
}

fn parse_slot(context: &mut Context) -> Result<ast::Slot, err::ParserError> {
    let start = context.curr_u16pos();
    context.next_token(); // eat keyword
    context.skip(is_superfluous_or_newline);
    let name = extract_word_value(context)?;
    context.next_token(); // eat value
    context.skip(is_superfluous_or_newline);
    let end = context.curr_u16pos();
    let body = parse_body(
        context,
        |context: &mut Context| match context.curr_token() {
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
        range: Range::new(start, end),
        body,
    })
}

fn parse_insert(context: &mut Context) -> Result<ast::Insert, err::ParserError> {
    let start = context.curr_u16pos();
    context.next_token(); // eat keyword
    context.skip(is_superfluous_or_newline);
    let name = extract_word_value(context)?;
    context.next_token(); // eat value
    context.skip(is_superfluous_or_newline);
    let end = context.curr_u16pos();
    let body = parse_body(
        context,
        |context: &mut Context| match context.curr_token() {
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
        range: Range::new(start, end),
        body,
    })
}

fn parse_text(context: &mut Context) -> Result<ast::TextNode, err::ParserError> {
    let start = context.curr_u16pos();
    context.next_token(); // eat render
    context.skip(is_superfluous_or_newline);
    let value = extract_string_value(context)?;
    context.next_token(); // eat value
    context.skip(is_superfluous_or_newline);

    let body = if context.curr_token() == &Token::CurlyOpen {
        parse_body(
            context,
            |context: &mut Context| match context.curr_token() {
                Token::Word(b"style") => Ok(ast::TextNodeBodyItem::Style(parse_style(context)?)),
                _ => Err(context.new_unexpected_token_error()),
            },
            Some((Token::CurlyOpen, Token::CurlyClose)),
        )?
    } else {
        vec![]
    };

    let end = context.curr_u16pos();

    Ok(ast::TextNode {
        id: context.next_id(),
        range: Range::new(start, end),
        value,
        body,
    })
}

fn extract_string_value(context: &mut Context) -> Result<String, err::ParserError> {
    if let Token::String(value) = context.curr_token() {
        Ok(trim_string(str::from_utf8(value).unwrap()))
    } else {
        return Err(context.new_unexpected_token_error());
    }
}

fn extract_word_value(context: &mut Context) -> Result<String, err::ParserError> {
    if let Token::Word(value) = context.curr_token() {
        Ok(str::from_utf8(value).unwrap().to_string())
    } else {
        return Err(context.new_unexpected_token_error());
    }
}

fn parse_override(context: &mut Context) -> Result<ast::Override, err::ParserError> {
    let start = context.curr_u16pos();
    context.next_token(); // eat override
    context.skip(is_superfluous_or_newline);
    let path = vec![];

    let body = if context.curr_token() == &Token::CurlyOpen {
        parse_body(
            context,
            |context: &mut Context| match context.curr_token() {
                Token::Word(b"style") => Ok(ast::OverrideBodyItem::Style(parse_style(context)?)),
                _ => Err(context.new_unexpected_token_error()),
            },
            Some((Token::CurlyOpen, Token::CurlyClose)),
        )?
    } else {
        vec![]
    };

    let end = context.curr_u16pos();

    Ok(ast::Override {
        id: context.next_id(),
        range: Range::new(start, end),
        path,
        body,
    })
}

fn parse_element(context: &mut Context) -> Result<ast::Element, err::ParserError> {
    let start = context.curr_u16pos();
    let tag_parts = parse_path(context)?;
    let namespace: Option<String> = if tag_parts.len() == 2 {
        Some(tag_parts.first().unwrap().clone())
    } else {
        None
    };

    let tag_name: String = tag_parts.last().unwrap().clone();

    context.skip(is_superfluous_or_newline);

    let parameters = if context.curr_token() == &Token::ParenOpen {
        parse_parameters(context)?
    } else {
        vec![]
    };

    let body = if context.curr_token() == &Token::CurlyOpen {
        parse_body(
            context,
            |context: &mut Context| match context.curr_token() {
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

    let end = context.curr_u16pos();

    Ok(ast::Element {
        id: context.next_id(),
        parameters,
        namespace,
        tag_name,
        range: Range::new(start, end),
        body,
    })
}

fn parse_parameters(context: &mut Context) -> Result<Vec<ast::Parameter>, err::ParserError> {
    context.next_token(); // eat (
    context.skip(is_superfluous_or_newline);
    let mut parameters: Vec<ast::Parameter> = vec![];

    while context.curr_token() != &Token::ParenClose {
        parameters.push(parse_parameter(context)?);
    }

    context.next_token(); // eat )
    context.skip(is_superfluous_or_newline);

    Ok(parameters)
}

fn parse_parameter(context: &mut Context) -> Result<ast::Parameter, err::ParserError> {
    let start = context.curr_u16pos();
    let name = extract_word_value(context)?;
    context.next_token(); // eat name
    context.skip(is_superfluous_or_newline);
    context.next_token(); // eat :
    context.skip(is_superfluous_or_newline);
    let value = parse_simple_expression(context)?;
    let end = context.curr_u16pos();

    // Since this isn't used anywhere else, we can include comma logic here
    context.skip(is_superfluous_or_newline);
    if context.curr_token() == &Token::Comma {
        context.next_token(); // eat
        context.skip(is_superfluous_or_newline);
    }

    Ok(ast::Parameter {
        id: context.next_id(),
        range: Range::new(start, end),
        name,
        value,
    })
}

fn parse_simple_expression(
    context: &mut Context,
) -> Result<ast::SimpleExpression, err::ParserError> {
    match context.curr_token() {
        Token::String(value) => Ok(ast::SimpleExpression::String(parse_string(context)?)),
        Token::Word(b"true" | b"false") => {
            Ok(ast::SimpleExpression::Boolean(parse_boolean(context)?))
        }
        Token::Word(_) => Ok(ast::SimpleExpression::Reference(parse_ref(context)?)),
        Token::SquareOpen => Ok(ast::SimpleExpression::Array(parse_array(context)?)),
        _ => return Err(context.new_unexpected_token_error()),
    }
}

fn parse_array(context: &mut Context) -> Result<ast::Array, err::ParserError> {
    let start = context.curr_u16pos();
    context.next_token(); // eat [
    context.skip(is_superfluous_or_newline);
    let mut items: Vec<ast::SimpleExpression> = vec![];

    while context.curr_token() != &Token::SquareClose {
        items.push(parse_simple_expression(context)?);
    }

    context.next_token(); // eat ]
    let end = context.curr_u16pos();

    Ok(ast::Array {
        id: context.next_id(),
        range: Range::new(start, end),
        items,
    })
}

fn parse_string(context: &mut Context) -> Result<ast::Str, err::ParserError> {
    let start = context.curr_u16pos();
    let value = extract_string_value(context)?;
    context.next_token();
    let end = context.curr_u16pos();

    Ok(ast::Str {
        id: context.next_id(),
        range: Range::new(start, end),
        value,
    })
}

fn parse_boolean(context: &mut Context) -> Result<ast::Boolean, err::ParserError> {
    let start = context.curr_u16pos();
    let value = context.curr_token() == &Token::Word(b"true");
    context.next_token();
    let end = context.curr_u16pos();

    Ok(ast::Boolean {
        id: context.next_id(),
        range: Range::new(start, end),
        value,
    })
}

fn parse_ref(context: &mut Context) -> Result<ast::Reference, err::ParserError> {
    let start = context.curr_u16pos();
    let path: Vec<String> = parse_path(context)?;
    let end = context.curr_u16pos();
    Ok(ast::Reference {
        id: context.next_id(),
        range: Range::new(start, end),
        path,
    })
}

fn parse_path(context: &mut Context) -> Result<Vec<String>, err::ParserError> {
    let mut path: Vec<String> = vec![extract_word_value(context)?];
    context.next_token();
    while context.curr_token() == &Token::Dot {
        context.next_token();
        path.push(extract_word_value(context)?);
        context.next_token();
    }
    Ok(path)
}

fn parse_body<TItem, TTest>(
    context: &mut Context,
    parse_item: TTest,
    ends: Option<(Token, Token)>,
) -> Result<Vec<TItem>, err::ParserError>
where
    TTest: Fn(&mut Context) -> Result<TItem, err::ParserError>,
{
    if ends != None {
        context.next_token();
        context.skip(is_superfluous_or_newline);
    }

    let mut body: Vec<TItem> = vec![];

    while context.curr_token() != &Token::None {
        if let Some((_, end)) = &ends {
            if context.curr_token() == end {
                context.next_token();
                context.skip(is_superfluous_or_newline);
                break;
            }
        }

        body.push(parse_item(context)?);
    }

    Ok(body)
}

fn parse_component_body(context: &mut Context) -> Result<ast::Component, err::ParserError> {
    let start = context.curr_u16pos();

    // eat component
    context.next_token();
    context.skip(is_superfluous_or_newline);

    let name = extract_word_value(context)?;

    // eat name
    context.next_token();

    let end = context.curr_u16pos();

    Ok(ast::Component {
        id: context.next_id(),
        name,
        body: vec![],
        range: Range::new(start, end),
    })
}

fn trim_string(value: &str) -> String {
    value[1..value.len() - 1].to_string()
}
