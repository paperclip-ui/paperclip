use super::ast;
use super::tokenizer::{is_superfluous, is_superfluous_or_newline, next_token, Token};
use crate::base::ast as base_ast;
use crate::base::ast::Range;
use crate::core::errors as err;
use crate::core::errors::ParserError;
use crate::core::id::{get_document_id, IDGenerator};
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

    let value: String = if let Some(Token::Keyword(value)) = context.curr_token {
        str::from_utf8(value).unwrap().to_string()
    } else {
        return Err(context.new_unexpected_token_error());
    };

    context.next_token()?; // eat name

    let end = context.curr_u16pos.clone();

    return Ok(ast::StyleDeclaration {
        id: context.next_id(),
        range: Range::new(start, end),
        name,
        value: value.to_string(),
    });
}
