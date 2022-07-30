use super::errors::{ErrorKind, ParserError};
use crate::base::ast;
use crate::base::ast::Range;
use crate::base::ast::U16Position;
use crate::core::id::{get_document_id, IDGenerator};
use crate::core::string_scanner::StringScanner;

struct Error {}

type NextToken<'src, Token> = dyn Fn(&mut StringScanner<'src>) -> Result<Token, ParserError>;

pub struct Context<'tokenizer, 'idgenerator, 'src, TToken> {
    pub curr_u16pos: U16Position,
    pub curr_token: Option<TToken>,
    pub source_url: String,
    pub id_generator: &'idgenerator mut IDGenerator,
    _next_token: &'tokenizer NextToken<'src, TToken>,
    pub scanner: &'src mut StringScanner<'src>, // pub tokenizer: &'tokenizer mut TTokenizer,
}

impl<'tokenizer, 'idgenerator, 'src, TToken> Context<'tokenizer, 'idgenerator, 'src, TToken> {
    pub fn new(
        scanner: &'src mut StringScanner<'src>,
        source_url: &String,
        _next_token: &'tokenizer NextToken<'src, TToken>,
        id_generator: &'idgenerator mut IDGenerator,
    ) -> Result<Context<'tokenizer, 'idgenerator, 'src, TToken>, ParserError> {
        Ok(Context {
            curr_u16pos: scanner.get_u16pos(),
            curr_token: Some(_next_token(scanner)?),
            _next_token,
            source_url: source_url.to_string(),
            id_generator,
            scanner,
        })
    }
    pub fn next_id(&mut self) -> String {
        self.id_generator.new_id()
    }
    pub fn next_token(&mut self) -> Result<(), ParserError> {
        self.curr_u16pos = self.scanner.get_u16pos();
        self.curr_token = if self.is_eof() {
            None
        } else {
            Some((self._next_token)(self.scanner)?)
        };

        Ok(())
    }
    pub fn skip<TTest>(&mut self, test: TTest)
    where
        TTest: Fn(&TToken) -> bool,
    {
        loop {
            if let Some(token) = &self.curr_token {
                if test(token) {
                    self.next_token();
                } else {
                    break;
                }
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

pub fn create_initial_context<'src>(
    source: &'src str,
    url: &String,
) -> (StringScanner<'src>, IDGenerator) {
    (
        StringScanner::new(source),
        IDGenerator::new(get_document_id(url)),
    )
}
