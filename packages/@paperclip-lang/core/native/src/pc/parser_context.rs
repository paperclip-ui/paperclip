use super::ast;
use super::errors::{ErrorKind, ParserError};
use super::tokenizer::{Token, Tokenizer};
use crate::base::ast::U16Position;
use crate::base::ast::{Position, Range};
use crate::base::string_scanner::StringScanner;
use crate::core::id::{get_document_id, IDGenerator};

struct Error {}

pub struct Context<'scan, 'src> {
    pub source_url: String,
    pub id_generator: IDGenerator,
    pub tokenizer: Tokenizer<'scan, 'src>,
}

impl<'scan, 'src> Context<'scan, 'src> {
    pub fn new(
        source: &'scan mut StringScanner<'src>,
        source_url: &String,
    ) -> Context<'scan, 'src> {
        Context {
            source_url: source_url.to_string(),
            id_generator: IDGenerator::new(get_document_id(source_url)),
            tokenizer: Tokenizer::new(source),
        }
    }
    pub fn get_pos(&self) -> Position {
        return self.tokenizer.source.get_pos();
    }
    pub fn next_id(&mut self) -> String {
        self.id_generator.new_id()
    }
    pub fn next_token(&mut self) {
        self.tokenizer.next();
    }
    pub fn skip<TTest>(&mut self, test: TTest)
    where
        TTest: Fn(&Token) -> bool,
    {
        self.tokenizer.skip(test)
    }
    pub fn get_u16pos(&self) -> U16Position {
        self.tokenizer.source.get_u16pos()
    }
    pub fn is_eof(&self) -> bool {
        self.tokenizer.is_eof()
    }
    pub fn curr_token(&self) -> &Token<'src> {
        &self.tokenizer.curr
    }
    pub fn curr_16pos(&self) -> &U16Position {
        &self.tokenizer.curr_16pos
    }
    pub fn curr_token_range(&self) -> Range {
        Range::new(
            self.tokenizer.curr_16pos.clone(),
            self.tokenizer.source.get_u16pos(),
        )
    }
    pub fn new_unexpected_token_error(&self) -> ParserError {
        ParserError::new(
            "Unexpected token".to_string(),
            Range::new(
                self.curr_16pos().clone(),
                self.tokenizer.source.get_u16pos(),
            ),
            ErrorKind::UnexpectedToken,
        )
    }
}
