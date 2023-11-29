use super::tokenizer::{is_superfluous, next_token, Token};
use crate::base::ast::Range;
use crate::core::errors as err;
use crate::core::errors::ParserError;
use crate::core::parser_context::Context;
use crate::core::string_scanner::StringScanner;
use crate::{base::ast as base_ast, core::parser_context::Options};
use paperclip_common::id::{get_document_id, IDGenerator};
use paperclip_proto::ast::docco as ast;
use std::str;

type ParserContext<'tokenizer, 'scanner, 'idgenerator, 'src> =
    Context<'tokenizer, 'scanner, 'idgenerator, 'src, Token<'src>>;

pub fn parse<'src>(source: &'src str, url: &str) -> Result<ast::Comment, ParserError> {
    let mut scanner = StringScanner::new(source);
    let mut id_generator = IDGenerator::new(get_document_id(url));
    parse_with_string_scanner(&mut scanner, &mut id_generator, url)
}

pub fn parse_with_string_scanner<'src, 'scanner, 'idgenerator>(
    source: &'scanner mut StringScanner<'src>,
    id_generator: &'idgenerator mut IDGenerator,
    url: &str,
) -> Result<ast::Comment, ParserError> {
    let mut context = Context::new(source, url, &next_token, id_generator, Options::new(vec![]))?;
    parse_comment(&mut context)
}

pub fn parse_comment(context: &mut ParserContext) -> Result<ast::Comment, ParserError> {
    if matches!(context.curr_token, Some(Token::CommentStart)) {
        context.next_token()?; // eat /**
    }
    let start = context.curr_u16pos.clone();
    let mut body: Vec<ast::CommentBodyItem> = vec![];
    while context.curr_token != Some(Token::CommentEnd) {
        body.push(
            (match &context.curr_token {
                Some(Token::At) => {
                    ast::comment_body_item::Inner::Property(parse_property(context)?)
                }
                _ => ast::comment_body_item::Inner::Text(parse_text(context)?),
            })
            .get_outer(),
        );
    }
    context.next_token()?; // eat CommentEnd
    let end = context.curr_u16pos.clone();

    Ok(ast::Comment {
        id: context.next_id(),
        range: Some(Range::new(start, end)),
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
    context.skip(is_superfluous)?;
    let value = Some(
        (match context.curr_token {
            Some(Token::ParenOpen) => {
                ast::property_value::Inner::Parameters(parse_parameters(context)?)
            }
            Some(Token::String(_)) => ast::property_value::Inner::Str(parse_string(context)?),
            _ => return Err(context.new_unexpected_token_error()),
        })
        .get_outer(),
    );
    let end = context.curr_u16pos.clone();

    Ok(ast::Property {
        id: context.next_id(),
        range: Some(Range::new(start, end)),
        name,
        value,
    })
}
pub fn parse_string(context: &mut ParserContext) -> Result<base_ast::Str, ParserError> {
    let start = context.curr_u16pos.clone();
    let value = extract_string_value(context)?;
    context.next_token()?; // eat
    let end = context.curr_u16pos.clone();
    Ok(base_ast::Str {
        id: context.next_id(),
        range: Some(Range::new(start, end)),
        value,
    })
}

pub fn parse_text(context: &mut ParserContext) -> Result<base_ast::Str, ParserError> {
    let start = context.curr_u16pos.clone();

    let mut buffer: Vec<String> = vec![];

    loop {
        // EOF
        if context.curr_token == None || context.curr_token == Some(Token::CommentEnd) {
            break;
        }

        // is prop©
        if context.curr_token == Some(Token::At) && matches!(context.peek(1), &Some(Token::Word(_)))
        {
            break;
        }

        if let Some(token) = &context.curr_token {
            match token {
                Token::Whitespace(b) | Token::Word(b) => {
                    buffer.push(str::from_utf8(b).unwrap().to_string());
                }
                Token::Byte(b) => {
                    buffer.push(str::from_utf8(&[b.clone()]).unwrap().to_string());
                }
                _ => {
                    return Err(context.new_unexpected_token_error());
                }
            }
        }

        context.next_token()?;
    }
    let end = context.curr_u16pos.clone();
    Ok(base_ast::Str {
        id: context.next_id(),
        range: Some(Range::new(start, end)),
        value: buffer.join(""),
    })
}

pub fn parse_number(context: &mut ParserContext) -> Result<base_ast::Num, ParserError> {
    let start = context.curr_u16pos.clone();
    let value = extract_number_value(context)?;
    context.next_token()?; // eat
    let end = context.curr_u16pos.clone();
    Ok(base_ast::Num {
        id: context.next_id(),
        range: Some(Range::new(start, end)),
        value,
    })
}

pub fn parse_boolean(context: &mut ParserContext) -> Result<base_ast::Bool, ParserError> {
    let start = context.curr_u16pos.clone();
    let value = extract_bool_value(context)?;
    context.next_token()?; // eat
    let end = context.curr_u16pos.clone();
    Ok(base_ast::Bool {
        id: context.next_id(),
        range: Some(Range::new(start, end)),
        value,
    })
}

fn extract_number_value(context: &mut ParserContext) -> Result<f32, err::ParserError> {
    if let Some(Token::Number(value)) = context.curr_token {
        Ok(value)
    } else {
        return Err(context.new_unexpected_token_error());
    }
}

fn extract_string_value(context: &mut ParserContext) -> Result<String, err::ParserError> {
    if let Some(Token::String(value)) = context.curr_token {
        Ok(trim_string(str::from_utf8(value).unwrap()))
    } else {
        return Err(context.new_unexpected_token_error());
    }
}

fn extract_bool_value(context: &mut ParserContext) -> Result<bool, err::ParserError> {
    if let Some(Token::Boolean(value)) = context.curr_token {
        Ok(value)
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

fn parse_parameters(
    context: &mut ParserContext,
) -> Result<ast::PropertyValueMap, err::ParserError> {
    let start = context.curr_u16pos.clone();

    context.next_token()?; // eat (

    let mut items: Vec<ast::Property> = vec![];
    while context.curr_token != None {
        items.push(parse_parameter(context)?);
        if context.curr_token == Some(Token::ParenClose) {
            break;
        }
        if context.curr_token == Some(Token::Comma) {
            context.next_token()?; // eat ,
            context.skip(is_superfluous)?;
        }
    }
    context.next_token()?; // eat )

    let end = context.curr_u16pos.clone();

    Ok(ast::PropertyValueMap {
        id: context.next_id(),
        range: Some(Range::new(start, end)),
        items,
    })
}

fn parse_list(context: &mut ParserContext) -> Result<ast::PropertyValueList, err::ParserError> {
    let start = context.curr_u16pos.clone();

    context.next_token()?; // eat [

    let mut items: Vec<ast::PropertyValue> = vec![];
    while context.curr_token != None {
        items.push(parse_property_value(context)?.get_outer());
        if context.curr_token == Some(Token::BracketClose) {
            break;
        }
        if context.curr_token == Some(Token::Comma) {
            context.next_token()?; // eat ,
            context.skip(is_superfluous)?;
        }
    }
    context.next_token()?; // eat ]

    let end = context.curr_u16pos.clone();

    Ok(ast::PropertyValueList {
        id: context.next_id(),
        range: Some(Range::new(start, end)),
        items,
    })
}

fn parse_parameter(context: &mut ParserContext) -> Result<ast::Property, err::ParserError> {
    let start = context.curr_u16pos.clone();
    let name = extract_word_value(context)?;
    context.next_token()?; // eat name
    context.skip(is_superfluous)?;
    context.next_token()?; // eat :
    context.skip(is_superfluous)?;
    let value = Some(parse_property_value(context)?.get_outer());
    let end = context.curr_u16pos.clone();

    Ok(ast::Property {
        id: context.next_id(),
        range: Some(Range::new(start, end)),
        name,
        value,
    })
}

fn parse_property_value(
    context: &mut ParserContext,
) -> Result<ast::property_value::Inner, err::ParserError> {
    match context.curr_token {
        Some(Token::String(_)) => Ok(ast::property_value::Inner::Str(parse_string(context)?)),
        Some(Token::ParenOpen) => Ok(ast::property_value::Inner::Parameters(parse_parameters(
            context,
        )?)),
        Some(Token::BracketOpen) => Ok(ast::property_value::Inner::List(parse_list(context)?)),
        Some(Token::Number(_)) => Ok(ast::property_value::Inner::Num(parse_number(context)?)),
        Some(Token::Boolean(_)) => Ok(ast::property_value::Inner::Bool(parse_boolean(context)?)),
        _ => Err(context.new_unexpected_token_error()),
    }
}
