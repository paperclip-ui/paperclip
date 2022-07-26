// Inspired by https://github.com/servo/rust-cssparser/blob/master/src/tokenizer.rs
use crate::base::ast::U16Position;
use crate::base::string_scanner::StringScanner;
use serde::Serialize;

#[derive(Debug, PartialEq, Serialize, Clone)]
pub enum Token<'src> {
    None,
    CurlyOpen,
    CurlyClose,
    ParenOpen,
    ParenClose,
    SquareOpen,
    SquareClose,
    Comma,
    Colon,
    Dot,
    NewLine(&'src [u8]),
    MultiLineComment(&'src [u8]),
    Space(&'src [u8]),
    Number(&'src [u8]),
    Word(&'src [u8]),
    String(&'src [u8]),
    Byte(u8),

    // Possibly glyphs
    Cluster(&'src [u8]),
}

pub struct Tokenizer<'scan, 'src> {
    pub curr_16pos: U16Position,
    pub curr: Token<'src>,
    pub source: &'scan mut StringScanner<'src>,
}

impl<'scan, 'src> Tokenizer<'scan, 'src> {
    pub fn is_eof(&self) -> bool {
        self.source.is_eof()
    }

    pub fn next(&mut self) {
        let pos = self.source.get_u16pos();
        let curr = self.next2();
        match curr {
            Ok(token) => {
                self.curr_16pos = pos;
                self.curr = token;
            }
            Err(_) => {
                self.curr = Token::None;
                self.curr_16pos = self.source.get_u16pos();
            }
        }
    }

    fn next2(&mut self) -> Result<Token<'src>, ()> {
        if self.source.is_eof() {
            return Err(());
        }

        let s_pos = self.source.pos;
        let start = self.source.source[self.source.pos];
        self.source.forward(1);

        return match start {
            b'{' => Ok(Token::CurlyOpen),
            b'}' => Ok(Token::CurlyClose),
            b'[' => Ok(Token::SquareOpen),
            b']' => Ok(Token::SquareClose),
            b'(' => Ok(Token::ParenOpen),
            b')' => Ok(Token::ParenClose),
            b',' => Ok(Token::Comma),
            b':' => Ok(Token::Colon),
            b'\"' | b'\'' => {
                while !self.source.is_eof() {
                    let mut curr = self.source.source[self.source.pos];

                    // escape next
                    if curr == b'\\' {
                        self.source.forward(2);
                        curr = self.source.source[self.source.pos];
                    }

                    self.source.forward(1);

                    if curr == start {
                        break;
                    }
                }

                return Ok(Token::String(&self.source.source[s_pos..self.source.pos]));
            }
            _ if is_space(start) => {
                let e_pos = self.source.scan(is_space).u8_pos;
                return Ok(Token::Space(&self.source.source[s_pos..e_pos]));
            }
            _ if is_newline(start) => {
                let e_pos = self.source.scan(is_newline).u8_pos;
                return Ok(Token::NewLine(&self.source.source[s_pos..e_pos]));
            }
            _ if is_az(start) => {
                let e_pos = self.source.scan(|b| is_az(b) || is_digit(b)).u8_pos;
                return Ok(Token::Word(&self.source.source[s_pos..e_pos]));
            }
            b'.' => Ok(Token::Dot),
            b => Ok(Token::Byte(b)),
        };
    }

    pub fn skip<TTest>(&mut self, test: TTest)
    where
        TTest: Fn(&Token) -> bool,
    {
        loop {
            if test(&self.curr) {
                self.next();
            } else {
                break;
            }
        }
    }
    pub fn new(source: &'scan mut StringScanner<'src>) -> Tokenizer<'scan, 'src> {
        let mut tokenizer = Tokenizer {
            curr: Token::None,
            curr_16pos: U16Position::new(0, 0, 0),
            source,
        };

        // prime current
        tokenizer.next();

        tokenizer
    }
}
pub fn step_ws(c: u8) -> bool {
    matches!(c, b'a'..=b'z' | b'A'..=b'Z')
}

pub fn is_az(c: u8) -> bool {
    matches!(c, b'a'..=b'z' | b'A'..=b'Z')
}

pub fn is_kw_or_digit(c: u8) -> bool {
    matches!(c, b'0'..=b'8')
}

pub fn is_digit(c: u8) -> bool {
    matches!(c, b'0'..=b'8')
}

pub fn is_space(c: u8) -> bool {
    matches!(c, b'\t' | b' ')
}
pub fn is_newline(c: u8) -> bool {
    matches!(c, b'\n' | b'\r')
}

pub fn is_superfluous(token: &Token) -> bool {
    matches!(token, Token::Space(_))
}

pub fn is_superfluous_or_newline(token: &Token) -> bool {
    is_superfluous(token) || matches!(token, Token::NewLine(_))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn can_tokenize_various_things() {}
}
