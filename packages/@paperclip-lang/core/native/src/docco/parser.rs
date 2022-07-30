use super::ast;
use crate::base::ast::Range;
use super::tokenizer::{next_token, Token};
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
    let start = context.curr_u16pos.clone();
    let mut body: Vec<ast::CommentBodyItem> = vec![];
    let end = context.curr_u16pos.clone();

    Ok(ast::Comment { 
        id: context.next_id(),
        range: Range::new(start, end),
        body
    })
}
