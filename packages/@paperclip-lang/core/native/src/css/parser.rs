use super::ast;
use super::tokenizer::{is_superfluous, is_superfluous_or_newline, next_token, Token};
use crate::base::ast as base_ast;
use crate::base::ast::Range;
use crate::core::errors as err;
use crate::core::errors::ParserError;
use crate::core::id::{IDGenerator};
use crate::core::parser_context::Context;
use crate::core::string_scanner::StringScanner;
use std::str;

type ParserContext<'tokenizer, 'scanner, 'idgenerator, 'src> =
    Context<'tokenizer, 'scanner, 'idgenerator, 'src, Token<'src>>;

pub fn parse_style_declarations_with_string_scanner<'src, 'scanner, 'idgenerator>(
    source: &'scanner mut StringScanner<'src>,
    id_generator: &'idgenerator mut IDGenerator,
    url: &String,
) -> Result<Vec<ast::StyleDeclaration>, ParserError> {
    let mut context = Context::new(source, url, &next_token, id_generator)?;
    parse_style_declarations(&mut context)
}

fn parse_style_declarations(
    context: &mut ParserContext,
) -> Result<Vec<ast::StyleDeclaration>, err::ParserError> {
    context.skip(is_superfluous_or_newline);
    context.next_token()?;
    context.skip(is_superfluous_or_newline);
    let mut decls: Vec<ast::StyleDeclaration> = vec![];
    while context.curr_token != Some(Token::CurlyClose) {
        decls.push(parse_style_declaration(context)?);
        context.skip(is_superfluous_or_newline);
    }
    context.next_token()?; // eat }

    Ok(decls)
}

fn parse_style_declaration(
    context: &mut ParserContext,
) -> Result<ast::StyleDeclaration, err::ParserError> {
    let start = context.curr_u16pos.clone();

    let name = if let Some(Token::Keyword(name)) = context.curr_token {
        str::from_utf8(name).unwrap().to_string()
    } else {
        return Err(context.new_unexpected_token_error());
    };
    context.next_token()?; // eat name

    context.skip(is_superfluous);
    context.next_token()?; // eat :
    context.skip(is_superfluous);

    let value = parse_comma_list(context)?;

    context.next_token()?; // eat name

    let end = context.curr_u16pos.clone();

    return Ok(ast::StyleDeclaration {
        id: context.next_id(),
        range: Range::new(start, end),
        name,
        value: value,
    });
}


fn parse_comma_list(
    context: &mut ParserContext,
) -> Result<ast::DeclarationValue, err::ParserError> {
    let start = context.curr_u16pos.clone();
    let first = parse_spaced_list(context)?;
    context.skip(is_superfluous);
    Ok(if matches!(context.curr_token, Some(Token::Comma)) {
        let mut items = vec![first];
        while matches!(context.curr_token, Some(Token::Comma)) {
            context.next_token()?;
            context.skip(is_superfluous);
            items.push(parse_decl_value(context)?);
        }
        let end = context.curr_u16pos.clone();
        ast::DeclarationValue::CommaList(ast::CommaList {
            id: context.next_id(),
            range: Range::new(start, end),
            items: Box::new(items)
        })
    } else {
        first
    })
}

fn parse_spaced_list(
    context: &mut ParserContext,
) -> Result<ast::DeclarationValue, err::ParserError> {
    let start = context.curr_u16pos.clone();
    let first = parse_decl_value(context)?;
    Ok(if matches!(context.curr_token, Some(Token::Space(_))) {
        let mut items = vec![first];
        while matches!(context.curr_token, Some(Token::Space(_))) {
            context.next_token()?;
            items.push(parse_decl_value(context)?);
        }
        let end = context.curr_u16pos.clone();
        ast::DeclarationValue::SpacedList(ast::SpacedList {
            id: context.next_id(),
            range: Range::new(start, end),
            items: Box::new(items)
        })
    } else {
        first
    })
}


fn parse_decl_value(
    context: &mut ParserContext,
) -> Result<ast::DeclarationValue, err::ParserError> {
    match context.curr_token {
        Some(Token::Number(_)) => {
            parse_decl_number(context)
        },
        Some(Token::Keyword(_)) => {
            Ok(parse_keyword(context)?)
        },
        _ => {
            return Err(context.new_unexpected_token_error());
        }
    }
}

fn parse_keyword(context: &mut ParserContext) -> Result<ast::DeclarationValue, err::ParserError> {
    Ok(if context.peek(1) == &Some(Token::ParenOpen) {
       ast::DeclarationValue::FunctionCall(parse_call(context)?)
    } else {
       ast::DeclarationValue::Reference(parse_reference(context)?)
    })
}

fn parse_call(context: &mut ParserContext) -> Result<ast::FunctionCall, err::ParserError> {
    let start = context.curr_u16pos.clone();
    let name = if let Some(Token::Keyword(word)) = context.curr_token {
        str::from_utf8(word).unwrap().to_string()
    } else {
        return Err(context.new_unexpected_token_error());
    };

    let arguments = parse_comma_list(context)?;
    let end = context.curr_u16pos.clone();
    Ok(ast::FunctionCall {
        id: context.next_id(),
        range: Range::new(start, end),
        name,
        arguments: Box::new(arguments)
    })
}

fn parse_reference(context: &mut ParserContext) -> Result<ast::Reference, err::ParserError> {
    let start = context.curr_u16pos.clone();
    let mut path: Vec<String> = vec![];

    loop {
        if let Some(Token::Keyword(word)) = context.curr_token {
            path.push(str::from_utf8(word).unwrap().to_string());
        }
        if context.curr_token == Some(Token::Period) {
            context.next_token()?;
        } else {
            break;
        }
    }
    context.next_token()?;
    let end = context.curr_u16pos.clone();
    Ok(ast::Reference {
        id: context.next_id(),
        range: Range::new(start, end),
        path
    })
}

fn parse_decl_number(
    context: &mut ParserContext,
) -> Result<ast::DeclarationValue, err::ParserError> {
    let start = context.curr_u16pos.clone();
    if let Some(Token::Number(value)) = context.curr_token {
       Ok(if let Some(Token::Keyword(unit)) = context.peek(1) {
            let unit = str::from_utf8(unit).unwrap().to_string();
            context.next_token()?;
            context.next_token()?;
            ast::DeclarationValue::Measurement(ast::Measurement {
                id: context.next_id(),
                range: Range::new(start, context.curr_u16pos.clone()),
                value,
                unit
            })
        } else {
            context.next_token()?;
            ast::DeclarationValue::Number(base_ast::Number {
                id: context.next_id(),
                range: Range::new(start, context.curr_u16pos.clone()),
                value,
            })
        })
    } else {
        Err(context.new_unexpected_token_error())
    }
}