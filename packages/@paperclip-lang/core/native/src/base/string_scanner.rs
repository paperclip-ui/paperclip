use super::ast::Range;
use super::ast::{Position, U16Position};
use serde::Serialize;

pub enum Char<'src> {
    Byte(u8),
    Cluster(&'src [u8]),
}

#[derive(Clone)]
pub struct StringScanner<'src> {
    pub source: &'src [u8],
    pub pos: usize,
    pub u16_pos: usize,
    pub u16_line: usize,
    pub u16_column: usize,
    len: usize,
}

#[derive(Debug)]
pub enum StringScannerError {
    EOF,
}

impl<'src> StringScanner<'src> {
    pub fn starts_with(&mut self, pattern: &[u8]) -> bool {
        self.source[self.pos..].starts_with(pattern)
    }

    pub fn get_pos(&self) -> Position {
        Position {
            u8_pos: self.pos,
            u16_pos: self.u16_pos,
            u16_line: self.u16_line,
            u16_column: self.u16_column,
        }
    }
    pub fn get_u16pos(&self) -> U16Position {
        U16Position {
            pos: self.u16_pos,
            line: self.u16_line,
            column: self.u16_column,
        }
    }
    pub fn set_pos(&mut self, pos: &Position) {
        self.pos = pos.u8_pos;
        self.u16_pos = pos.u16_pos;
        self.u16_line = pos.u16_line;
        self.u16_column = pos.u16_column;
    }

    pub fn new(source: &'src str) -> StringScanner<'src> {
        StringScanner {
            source: source.as_bytes(),
            len: source.len(),
            pos: 0,
            u16_pos: 0,
            u16_line: 1,
            u16_column: 1,
        }
    }
    pub fn forward(&mut self, steps: usize) {
        let mut subcol = 0;

        let new_pos = self.pos + steps;

        if new_pos < self.source.len() {
            for i in self.pos..new_pos {
                if i == self.len {
                    break;
                }
                let c = self.source[i];
                if c == b'\n' || c == b'\r' {
                    subcol = i - self.pos;

                    // reset to zero since it'll be incremented in the proceeding code. This will always be 1
                    self.u16_column = 0;
                    self.u16_line += 1;
                }
            }
        }

        self.pos = new_pos;
        self.u16_pos += steps;
        self.u16_column += steps - subcol;
    }
    pub fn next_char(&mut self) -> Result<Char<'src>, StringScannerError> {
        let c = self.curr_byte()?;
        let mut len = 1;
        let mut utf8_step = 1;

        if c < 0x80 {
            len = 1;
        } else if c < 0xC0 {
            len = 1;
        } else if c < 0xE0 {
            len = 2;
        } else if c < 0xF0 {
            len = 3;
        } else if c < 0xF8 {
            len = 4;
            utf8_step = 2;
        }

        if len == 1 {
            self.forward(1);
            Ok(Char::Byte(c))
        } else {
            let utf8_pos = self.u16_pos;
            let utf8_column = self.u16_column;
            let buffer = &self.source[self.pos..(self.pos + len)];
            self.forward(len);
            self.u16_pos = utf8_pos + utf8_step;
            self.u16_column = utf8_column + utf8_step;
            Ok(Char::Cluster(buffer))
        }
    }
    pub fn curr_byte(&self) -> Result<u8, StringScannerError> {
        if self.pos < self.source.len() {
            Ok(self.source[self.pos])
        } else {
            Err(StringScannerError::EOF)
        }
    }
    pub fn is_eof(&self) -> bool {
        self.source.len() == 0 || self.pos >= self.source.len()
    }

    pub fn search<FF>(&mut self, test: FF) -> &'src [u8]
    where
        FF: Fn(u8) -> bool,
    {
        &self.source[self.pos..self.scan(test).u8_pos]
    }

    pub fn scan<FF>(&mut self, test: FF) -> Position
    where
        FF: Fn(u8) -> bool,
    {
        let len = self.source.len();

        loop {
            if self.pos >= len {
                break;
            }

            let pos = self.get_pos();
            let c = self.next_char().unwrap();

            if let Char::Byte(b) = c {
                if !test(b) {
                    self.set_pos(&pos);
                    break;
                }
            }
        }

        return self.get_pos();
    }
}
