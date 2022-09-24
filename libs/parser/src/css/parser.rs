use super::ast;
use super::tokenizer::{is_superfluous, is_superfluous_or_newline, next_token, Token};
use crate::base::ast as base_ast;
use crate::base::ast::Range;
use crate::core::errors as err;
use crate::core::errors::ParserError;
use crate::core::parser_context::Context;
use crate::core::string_scanner::StringScanner;
use paperclip_common::id::IDGenerator;
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

pub fn parse_style_declaration_with_string_scanner<'src, 'scanner, 'idgenerator>(
    source: &'scanner mut StringScanner<'src>,
    id_generator: &'idgenerator mut IDGenerator,
    url: &String,
) -> Result<ast::DeclarationValue, ParserError> {
    let mut context = Context::new(source, url, &next_token, id_generator)?;
    context.skip(is_superfluous)?;
    Ok(parse_decl_value(&mut context)?.get_outer())
}

fn parse_style_declarations(
    context: &mut ParserContext,
) -> Result<Vec<ast::StyleDeclaration>, err::ParserError> {
    context.skip(is_superfluous_or_newline)?;
    context.next_token()?;
    context.skip(is_superfluous_or_newline)?;
    let mut decls: Vec<ast::StyleDeclaration> = vec![];
    while context.curr_token != Some(Token::CurlyClose) {
        decls.push(parse_style_declaration(context)?);
        context.skip(is_superfluous_or_newline)?;
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

    context.skip(is_superfluous)?;
    context.next_token()?; // eat :
    context.skip(is_superfluous)?;

    let value = parse_comma_list(context)?.get_outer();

    let end = context.curr_u16pos.clone();

    return Ok(ast::StyleDeclaration {
        id: context.next_id(),
        range: Some(Range::new(start, end)),
        name,
        value: Some(value),
    });
}

fn parse_comma_list(
    context: &mut ParserContext,
) -> Result<ast::declaration_value::Inner, err::ParserError> {
    let start = context.curr_u16pos.clone();
    let first = parse_spaced_list(context)?;
    context.skip(is_superfluous)?;
    Ok(if matches!(context.curr_token, Some(Token::Comma)) {
        let mut items = vec![first.get_outer()];
        while matches!(context.curr_token, Some(Token::Comma)) {
            context.next_token()?;
            context.skip(is_superfluous)?;
            items.push(parse_spaced_list(context)?.get_outer());
        }
        let end = context.curr_u16pos.clone();
        ast::declaration_value::Inner::CommaList(ast::CommaList {
            id: context.next_id(),
            range: Some(Range::new(start, end)),
            items,
        })
    } else {
        first
    })
}

fn parse_spaced_list(
    context: &mut ParserContext,
) -> Result<ast::declaration_value::Inner, err::ParserError> {
    let start = context.curr_u16pos.clone();
    let first = parse_arithmetic(context)?;
    Ok(if matches!(context.curr_token, Some(Token::Space(_))) {
        let mut items = vec![first.get_outer()];
        while matches!(context.curr_token, Some(Token::Space(_))) {
            context.next_token()?;
            items.push(parse_arithmetic(context)?.get_outer());
        }
        let end = context.curr_u16pos.clone();
        ast::declaration_value::Inner::SpacedList(ast::SpacedList {
            id: context.next_id(),
            range: Some(Range::new(start, end)),
            items,
        })
    } else {
        first
    })
}

fn parse_arithmetic(
    context: &mut ParserContext,
) -> Result<ast::declaration_value::Inner, err::ParserError> {
    let start = context.curr_u16pos.clone();
    let left = parse_decl_value(context)?;
    let operator_option = match context.peek_skip(0, is_superfluous) {
        Some(Token::Plus) => Some("+".to_string()),
        Some(Token::Minus) => Some("-".to_string()),
        Some(Token::Star) => Some("*".to_string()),
        Some(Token::Backslash) => Some("/".to_string()),
        _ => None,
    };

    Ok(if let Some(operator) = operator_option {
        context.skip(is_superfluous)?;
        context.next_token()?; // eat operator
        context.skip(is_superfluous)?;
        let right = parse_decl_value(context)?;
        let end = context.curr_u16pos.clone();
        ast::declaration_value::Inner::Arithmetic(Box::new(ast::Arithmetic {
            id: context.next_id(),
            range: Some(Range::new(start, end)),
            left: Some(Box::new(left.get_outer())),
            right: Some(Box::new(right.get_outer())),
            operator,
        }))
    } else {
        left
    })
}

fn parse_decl_value(
    context: &mut ParserContext,
) -> Result<ast::declaration_value::Inner, err::ParserError> {
    match context.curr_token {
        Some(Token::Number(_)) => parse_decl_number(context),
        Some(Token::Keyword(_)) => Ok(parse_keyword(context)?),
        Some(Token::String(_)) => Ok(parse_string(context)?),
        Some(Token::HexColor(_)) => Ok(parse_hex_color(context)?),
        _ => {
            return Err(context.new_unexpected_token_error());
        }
    }
}

fn parse_keyword(
    context: &mut ParserContext,
) -> Result<ast::declaration_value::Inner, err::ParserError> {
    Ok(if context.peek(1) == &Some(Token::ParenOpen) {
        ast::declaration_value::Inner::FunctionCall(Box::new(parse_call(context)?))
    } else {
        ast::declaration_value::Inner::Reference(parse_reference(context)?)
    })
}

fn parse_string(
    context: &mut ParserContext,
) -> Result<ast::declaration_value::Inner, err::ParserError> {
    if let Some(Token::String(value)) = context.curr_token {
        let start = context.curr_u16pos.clone();
        context.next_token()?;
        let end = context.curr_u16pos.clone();
        Ok(ast::declaration_value::Inner::Str(base_ast::Str {
            id: context.next_id(),
            range: Some(Range::new(start, end)),
            value: trim_string(str::from_utf8(value).unwrap()),
        }))
    } else {
        Err(context.new_unexpected_token_error())
    }
}

fn trim_string(value: &str) -> String {
    value[1..value.len() - 1].to_string()
}

fn parse_hex_color(
    context: &mut ParserContext,
) -> Result<ast::declaration_value::Inner, err::ParserError> {
    let start = context.curr_u16pos.clone();
    let value = if let Some(Token::HexColor(value)) = context.curr_token {
        str::from_utf8(value).unwrap().to_string()
    } else {
        return Err(context.new_unexpected_token_error());
    };
    context.next_token()?; // eat #
    let end = context.curr_u16pos.clone();

    Ok(ast::declaration_value::Inner::HexColor(ast::HexColor {
        id: context.next_id(),
        range: Some(Range::new(start, end)),
        value,
    }))
}

fn parse_call(context: &mut ParserContext) -> Result<ast::FunctionCall, err::ParserError> {
    let start = context.curr_u16pos.clone();
    let name = if let Some(Token::Keyword(word)) = context.curr_token {
        str::from_utf8(word).unwrap().to_string()
    } else {
        return Err(context.new_unexpected_token_error());
    };

    context.next_token()?;
    context.next_token()?; // eat (
    let arguments = parse_comma_list(context)?.get_outer();
    context.next_token()?;
    let end = context.curr_u16pos.clone();
    Ok(ast::FunctionCall {
        id: context.next_id(),
        range: Some(Range::new(start, end)),
        name,
        arguments: Some(Box::new(arguments)),
    })
}

fn parse_reference(context: &mut ParserContext) -> Result<ast::Reference, err::ParserError> {
    let start = context.curr_u16pos.clone();
    let mut path: Vec<String> = vec![];

    loop {
        if let Some(Token::Keyword(word)) = context.curr_token {
            path.push(str::from_utf8(word).unwrap().to_string());
            context.next_token()?;
        }
        if context.curr_token == Some(Token::Period) {
            context.next_token()?;
        } else {
            break;
        }
    }
    let end = context.curr_u16pos.clone();
    Ok(ast::Reference {
        id: context.next_id(),
        range: Some(Range::new(start, end)),
        path,
    })
}

fn parse_decl_number(
    context: &mut ParserContext,
) -> Result<ast::declaration_value::Inner, err::ParserError> {
    let start = context.curr_u16pos.clone();
    if let Some(Token::Number(value)) = context.curr_token {
        let unit_option = match context.peek(1) {
            Some(Token::Keyword(unit)) => Some(str::from_utf8(unit).unwrap().to_string()),
            Some(Token::Percent) => Some("%".to_string()),
            _ => None,
        };
        context.next_token()?; // eat number

        Ok(if let Some(unit) = unit_option {
            context.next_token()?; // eat unit
            ast::declaration_value::Inner::Measurement(ast::Measurement {
                id: context.next_id(),
                range: Some(Range::new(start, context.curr_u16pos.clone())),
                value,
                unit,
            })
        } else {
            ast::declaration_value::Inner::Number(base_ast::Number {
                id: context.next_id(),
                range: Some(Range::new(start, context.curr_u16pos.clone())),
                value,
            })
        })
    } else {
        Err(context.new_unexpected_token_error())
    }
}
