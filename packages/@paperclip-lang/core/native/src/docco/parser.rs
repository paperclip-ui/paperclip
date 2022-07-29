use super::ast;
use super::tokenizer::{next_token, Token};
use crate::base::errors::ParserError;
use crate::base::parser_context::Context;
use crate::base::string_scanner::StringScanner;

type ParserContext<'tokenizer, 'src> = Context<'tokenizer, 'src, Token<'src>>;

pub fn parse<'src>(source: &'src str, url: &String) -> Result<ast::Comment, ParserError> {
    let mut scanner = StringScanner::new(source);
    parse_with_string_scanner(&mut scanner, url)
}

pub fn parse_with_string_scanner<'src>(
    source: &'src mut StringScanner<'src>,
    url: &String,
) -> Result<ast::Comment, ParserError> {
    let mut context = Context::new(source, &next_token, url);
    parse_comment(&mut context)
}

pub fn parse_comment(context: &mut ParserContext) -> Result<ast::Comment, ParserError> {
    let mut body: Vec<ast::CommentBodyItem> = vec![];

    Ok(ast::Comment { body })
}
