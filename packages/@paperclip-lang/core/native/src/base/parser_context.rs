use super::ast;
use super::errors::{ErrorKind, ParserError};
use crate::base::ast::U16Position;
use crate::base::ast::{Range};
use crate::base::string_scanner::StringScanner;
use crate::core::id::{get_document_id, IDGenerator};

struct Error {}

type NextToken<'src, Token> = dyn Fn(&mut StringScanner<'src>) -> Token;

pub struct Context<'tokenizer, 'src, TToken> {
    pub curr_u16pos: U16Position,
    pub curr_token: TToken,
    pub source_url: String,
    pub id_generator: IDGenerator,
    _next_token: &'tokenizer NextToken<'src, TToken>,
    scanner: &'src mut StringScanner<'src>, // pub tokenizer: &'tokenizer mut TTokenizer,
}

impl<'tokenizer, 'src, TToken> Context<'tokenizer, 'src, TToken> {
    pub fn new(
        scanner: &'src mut StringScanner<'src>,
        _next_token: &'tokenizer NextToken<'src, TToken>,
        source_url: &String,
    ) -> Context<'tokenizer, 'src, TToken> {
        Context {
            curr_u16pos: scanner.get_u16pos(),
            curr_token: _next_token(scanner),
            _next_token,
            source_url: source_url.to_string(),
            id_generator: IDGenerator::new(get_document_id(source_url)),
            scanner,
        }
    }
    pub fn next_id(&mut self) -> String {
        self.id_generator.new_id()
    }
    pub fn next_token(&mut self) {
        self.curr_u16pos = self.scanner.get_u16pos();
        self.curr_token = (self._next_token)(self.scanner);
    }
    pub fn skip<TTest>(&mut self, test: TTest)
    where
        TTest: Fn(&TToken) -> bool,
    {
        loop {
            if test(&self.curr_token) {
                self.next_token();
            } else {
                break;
            }
        }
    }
    pub fn get_u16pos(&self) -> U16Position {
        self.scanner.get_u16pos()
    }
    pub fn is_eof(&self) -> bool {
        self.scanner.is_eof()
    }
    pub fn new_unexpected_token_error(&self) -> ParserError {
        ParserError::new(
            "Unexpected token".to_string(),
            Range::new(self.curr_u16pos.clone(), self.get_u16pos()),
            ErrorKind::UnexpectedToken,
        )
    }
}
