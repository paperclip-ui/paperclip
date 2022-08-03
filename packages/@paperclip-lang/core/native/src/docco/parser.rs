use super::ast;
use crate::base::ast as base_ast;
use std::str;
use crate::core::errors as err;
use super::tokenizer::{next_token, is_superfluous, Token};
use crate::base::ast::Range;
use crate::core::errors::ParserError;
use crate::core::id::{get_document_id, IDGenerator};
use crate::core::parser_context::Context;
use crate::core::string_scanner::StringScanner;

type ParserContext<'tokenizer, 'idgenerator, 'src> =
    Context<'tokenizer, 'idgenerator, 'src, Token<'src>>;

pub fn parse<'src>(source: &'src str, url: &String) -> Result<ast::Comment, ParserError> {
    let mut scanner = StringScanner::new(source);
    let mut id_generator = IDGenerator::new(get_document_id(url));
    parse_with_string_scanner(&mut scanner, &mut id_generator, url)
}

pub fn parse_with_string_scanner<'src, 'idgenerator>(
    source: &'src mut StringScanner<'src>,
    id_generator: &'idgenerator mut IDGenerator,
    url: &String,
) -> Result<ast::Comment, ParserError> {
    let mut context = Context::new(source, url, &next_token, id_generator)?;
    parse_comment(&mut context)
}

pub fn parse_comment(context: &mut ParserContext) -> Result<ast::Comment, ParserError> {
    context.next_token()?; // eat /**
    let start = context.curr_u16pos.clone();
    println!("{:?}", context.curr_token);
    let mut body: Vec<ast::CommentBodyItem> = vec![];
    loop {
        if context.curr_token == None {
            break;
        }
        body.push(match &context.curr_token {
            Some(Token::At) => parse_property(context),
            _ => parse_string(context)
        });
    }
    let end = context.curr_u16pos.clone();

    Ok(ast::Comment {
        id: context.next_id(),
        range: Range::new(start, end),
        body,
    })
}


fn trim_string(value: &str) -> String {
    value[1..value.len() - 1].to_string()
}


pub fn parse_property(context: &mut ParserContext) -> Result<ast::Property, ParserError> {
    let start = context.curr_u16pos.clone();
    context.next_token()?; // eat @
    let name = extract_word_value(context)?;
    context.next_token()?;
    let value = match context.curr_token {
        Some(Token::ParenOpen) => ast::PropertyValue::Parameters(parse_parameters(context)?),
        Token::String(value) => ast::PropertyValue::String(parse_string(context)?)
    };
    let end = context.curr_u16pos.clone();

    Ok(ast::Property {
        id: context.next_id(),
        range: Range::new(start, end),
        name,
        value
    })
}
pub fn parse_string(context: &mut ParserContext) -> Result<base_ast::Str, ParserError> {
    let start = context.curr_u16pos.clone();
    let value = extract_string_value(context)?;
    context.next_token()?; // eat
    let end = context.curr_u16pos.clone();
    Ok(base_ast::Str {
        id: context.next_id(),
        range: Range::new(start, end),
        value
    })
}



fn extract_string_value(context: &mut ParserContext) -> Result<String, err::ParserError> {
    if let Some(Token::String(value)) = context.curr_token {
        Ok(trim_string(str::from_utf8(value).unwrap()))
    } else {
        return Err(context.new_unexpected_token_error());
    }
}


fn extract_word_value(context: &mut ParserContext) -> Result<String, err::ParserError> {
    if let Some(Token::Word(value)) = context.curr_token {
        Ok(str::from_utf8(value).unwrap().to_string())
    } else {
        return Err(context.new_unexpected_token_error());
    }
}

fn parse_parameters(context: &mut ParserContext) -> Result<ast::Parameters, err::ParserError> {
    context.next_token(); // eat (
        
    let mut items: Vec<ast::Parameter> = vec![];
    while ast.curr_token !== Token::ParenClose {
        items.push(parse_parameter(context)?);
    }


    // let name = extract_word_value(context)?;
    // context.next_token(); // eat :
}

fn parse_parameter(context: &mut ParserContext) -> Result<ast::Parameter, err::ParserError> {
    let start = context.curr_u16pos.clone();
    let name = extract_word_value(context)?;
    context.next_token(); // eat :
    let end = context.curr_u16pos.clone();


    Ok(ast::Parameter {
        id: context.next_id(),
        range: Range::new(start, end)
    });
}


// TODO - generalize this - make a trait
fn parse_body<TItem, TTest>(
    context: &mut ParserContext,
    parse_item: TTest,
    ends: Option<(Token, Token)>,
) -> Result<Vec<TItem>, err::ParserError>
where
    TTest: Fn(&mut ParserContext) -> Result<TItem, err::ParserError>,
{
    if ends != None {
        context.next_token()?;
        context.skip(is_superfluous);
    }

    let mut body: Vec<TItem> = vec![];

    while context.curr_token != None {
        if let Some((_, end)) = &ends {
            if let Some(curr) = &context.curr_token {
                if curr == end {
                    context.next_token()?;
                    context.skip(is_superfluous);
                    break;
                }
            }
        }

        body.push(parse_item(context)?);
    }

    Ok(body)
}
