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

fn parse_document<'scan, 'src>(
    context: &mut Context<'scan, 'src>,
) -> Result<ast::Document, err::ParserError> {
    let mut body: Vec<ast::DocumentBodyItem> = vec![];
    let start = context.get_u16pos();
    loop {
        context.skip(is_superfluous_or_newline);
        if context.curr_token() == &Token::None {
            break;
        }
        body.push(parse_document_child(context)?);
    }
    let end = context.tokenizer.source.get_u16pos();

    Ok(ast::Document {
        id: context.id_generator.new_id(),
        range: Range::new(start, end),
        body,
    })
}

fn parse_document_child<'scan, 'src>(
    context: &mut Context<'scan, 'src>,
) -> Result<ast::DocumentBodyItem, err::ParserError> {
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

fn parse_import<'scan, 'src>(
    context: &mut Context<'scan, 'src>,
) -> Result<ast::Import, err::ParserError> {
    let start = context.curr_16pos().clone();

    // eat statement
    context.next_token();
    context.skip(is_superfluous_or_newline);

    let path = if let Token::String(name) = context.curr_token() {
        trim_string(str::from_utf8(name).unwrap())
    } else {
        return Err(context.new_unexpected_token_error());
    };

    // eat string
    context.next_token();
    context.skip(is_superfluous_or_newline);

    // eat "as"
    context.next_token();
    context.skip(is_superfluous_or_newline);

    let namespace = if let Token::Word(name) = context.curr_token() {
        str::from_utf8(name).unwrap().to_string()
    } else {
        return Err(context.new_unexpected_token_error());
    };

    // eat namespace
    context.next_token();
    context.skip(is_superfluous_or_newline);

    let end = context.curr_16pos().clone();

    Ok(ast::Import {
        id: context.next_id(),
        path,
        namespace,
        range: Range::new(start, end),
    })
}

fn parse_style<'scan, 'src>(
    context: &mut Context<'scan, 'src>,
) -> Result<ast::Style, err::ParserError> {
    let start = context.curr_16pos().clone();

    // eat statement
    context.next_token();
    context.skip(is_superfluous_or_newline);
    context.next_token(); // eat {
    context.skip(is_superfluous_or_newline);
    context.next_token(); // eat }
    context.skip(is_superfluous_or_newline);

    let end = context.curr_16pos().clone();

    Ok(ast::Style {
        id: context.next_id(),
        body: vec![],
        range: Range::new(start, end),
    })
}

fn parse_component<'scan, 'src>(
    context: &mut Context<'scan, 'src>,
) -> Result<ast::Component, err::ParserError> {
    let start = context.curr_16pos().clone();

    // eat component
    context.next_token();
    context.skip(is_superfluous_or_newline);

    let name = if let Token::Word(name) = context.curr_token() {
        str::from_utf8(name).unwrap().to_string()
    } else {
        return Err(context.new_unexpected_token_error());
    };

    // eat name
    context.next_token();
    context.skip(is_superfluous_or_newline);
    context.next_token(); // eat {
    context.skip(is_superfluous_or_newline);
    context.next_token(); // eat }
    context.skip(is_superfluous_or_newline);

    let end = context.curr_16pos().clone();

    Ok(ast::Component {
        id: context.next_id(),
        name,
        body: vec![],
        range: Range::new(start, end),
    })
}

fn parse_component_body<'scan, 'src>(
    context: &mut Context<'scan, 'src>,
) -> Result<ast::Component, err::ParserError> {
    let start = context.curr_16pos().clone();

    // eat component
    context.next_token();
    context.skip(is_superfluous_or_newline);

    let name = if let Token::Word(name) = context.curr_token() {
        str::from_utf8(name).unwrap().to_string()
    } else {
        return Err(context.new_unexpected_token_error());
    };

    // eat name
    context.next_token();

    let end = context.curr_16pos().clone();

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
