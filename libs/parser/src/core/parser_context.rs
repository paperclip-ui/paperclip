use super::errors::{ErrorKind, ParserError};
use crate::base::ast::Range;
use crate::base::ast::U16Position;
use crate::core::string_scanner::StringScanner;
use paperclip_common::id::{get_document_id, IDGenerator};
use std::collections::VecDeque;
use wasm_bindgen::prelude::*;

type NextToken<'src, Token> = dyn Fn(&mut StringScanner<'src>) -> Result<Token, ParserError>;

#[derive(Clone)]
#[wasm_bindgen]
pub struct Options {
    experimental: Vec<String>,
}

#[wasm_bindgen]
impl Options {
    #[wasm_bindgen(getter)]
    pub fn experimental(&self) -> js_sys::Array {
        self.experimental
            .clone()
            .into_iter()
            .map(JsValue::from)
            .collect()
    }
}

impl Options {
    pub fn new(experimental: Vec<String>) -> Self {
        Options { experimental }
    }
    pub fn all_experiments() -> Self {
        Options::new(vec![
            "condition".to_string(),
            "repeat".to_string(),
            "script".to_string(),
        ])
    }

    pub fn feature_enabled(&self, feature: &str) -> bool {
        self.experimental.contains(&feature.to_string())
    }
}

pub struct Context<'tokenizer, 'scanner, 'idgenerator, 'src, TToken: Clone> {
    pub curr_u16pos: U16Position,
    pub curr_token: Option<TToken>,
    pub token_pool: VecDeque<(Option<TToken>, U16Position)>,
    pub id_seed: String,
    pub id_generator: &'idgenerator mut IDGenerator,
    _next_token: &'tokenizer NextToken<'src, TToken>,
    pub options: Options,
    pub scanner: &'scanner mut StringScanner<'src>, // pub tokenizer: &'tokenizer mut TTokenizer,
}

impl<'tokenizer, 'scanner, 'idgenerator, 'src, TToken: Clone>
    Context<'tokenizer, 'scanner, 'idgenerator, 'src, TToken>
{
    pub fn new(
        scanner: &'scanner mut StringScanner<'src>,
        id_seed: &str,
        _next_token: &'tokenizer NextToken<'src, TToken>,
        id_generator: &'idgenerator mut IDGenerator,
        options: Options,
    ) -> Result<Context<'tokenizer, 'scanner, 'idgenerator, 'src, TToken>, ParserError> {
        Ok(Context {
            curr_u16pos: scanner.get_u16pos(),
            token_pool: VecDeque::new(),
            curr_token: Some(_next_token(scanner)?),
            _next_token,
            options,
            id_seed: id_seed.to_string(),
            id_generator,
            scanner,
        })
    }

    pub fn next_id(&mut self) -> String {
        self.id_generator.new_id()
    }

    pub fn peek_skip<TSkip>(&mut self, step: usize, skip: TSkip) -> &Option<TToken>
    where
        TSkip: Fn(&TToken) -> bool,
    {
        let mut i = 0;
        while let Some(token) = self.peek(i) {
            if skip(token) {
                i += 1;
            } else {
                break;
            }
        }

        self.peek(step + i)
    }

    pub fn peek(&mut self, step: usize) -> &Option<TToken> {
        if step == 0 {
            return &self.curr_token;
        }

        if step > self.token_pool.len() {
            let diff = step - self.token_pool.len();
            for _i in [0..diff] {
                if let Ok(token_info) = self.next_token2() {
                    self.token_pool.push_back(token_info);
                }
            }
        }

        if let Some((token_option, _pos)) = self.token_pool.get(step - 1) {
            token_option
        } else {
            &None
        }
    }

    pub fn next_token(&mut self) -> Result<(), ParserError> {
        if let Some((token_option, pos)) = self.token_pool.pop_front() {
            self.curr_token = token_option;
            self.curr_u16pos = pos;
        } else {
            let (token, pos) = self.next_token2()?;
            self.curr_u16pos = pos;
            self.curr_token = token;
        }

        Ok(())
    }

    fn next_token2(&mut self) -> Result<(Option<TToken>, U16Position), ParserError> {
        let pos = self.scanner.get_u16pos();

        let token = if self.is_eof() {
            None
        } else {
            Some((self._next_token)(self.scanner)?)
        };

        Ok((token, pos))
    }
    pub fn skip<TTest>(&mut self, test: TTest) -> Result<(), ParserError>
    where
        TTest: Fn(&TToken) -> bool,
    {
        loop {
            if let Some(token) = &self.curr_token {
                if test(token) {
                    self.next_token()?;
                } else {
                    return Ok(());
                }
            } else {
                return Ok(());
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
    url: &str,
) -> (StringScanner<'src>, IDGenerator) {
    (
        StringScanner::new(source),
        IDGenerator::new(get_document_id(url)),
    )
}
