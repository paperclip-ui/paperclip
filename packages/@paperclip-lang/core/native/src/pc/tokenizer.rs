// Inspired by https://github.com/servo/rust-cssparser/blob/master/src/tokenizer.rs
use crate::base::ast::U16Position;
use crate::base::string_scanner::{StringScanner, is_az, is_digit, is_space, is_newline};
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
    Backslack,
    Dot,
    NewLine(&'src [u8]),
    MultiLineComment(&'src [u8]),
    DoccoStart,
    Space(&'src [u8]),
    Number(&'src [u8]),
    Word(&'src [u8]),
    String(&'src [u8]),
    Byte(u8),

    // Possibly glyphs
    Cluster(&'src [u8]),
}


pub fn next_token<'src>(source:&mut StringScanner<'src>) -> Token<'src> {
    if source.is_eof() {
        return Token::None;
    }

    let s_pos = source.pos;
    let start = source.source[source.pos];
    source.forward(1);

    return match start {
        b'{' => Token::CurlyOpen,
        b'}' => Token::CurlyClose,
        b'[' => Token::SquareOpen,
        b']' => Token::SquareClose,
        b'(' => Token::ParenOpen,
        b')' => Token::ParenClose,
        b',' => Token::Comma,
        b':' => Token::Colon,
        b'/' => {
            if source.peek(0) == Some(b'*') {
                // eat *
                source.forward(1);

                // Look for /**
                if source.peek(0) == Some(b'*') {
                    source.forward(1);
                    return Token::DoccoStart;
                }

                // Eat the entire comment
                while !source.is_eof() {
                    let curr = source.source[source.pos];
                    if curr == b'*' && source.peek(1) == Some(b'/') {
                        let e_pos = source.pos + 2;
                        source.forward(2);
                        return Token::MultiLineComment(&source.source[s_pos..e_pos]);
                    }
                    source.forward(1);
                }

                // TODO - this should be more descriptive
                Token::None
            } else {
                Token::Backslack
            }
        }
        b'\"' | b'\'' => {
            while !source.is_eof() {
                let mut curr = source.source[source.pos];

                // escape next
                if curr == b'\\' {
                    source.forward(2);
                    curr = source.source[source.pos];
                }

                source.forward(1);

                if curr == start {
                    break;
                }
            }

            return Token::String(&source.source[s_pos..source.pos]);
        }
        _ if is_space(start) => {
            let e_pos = source.scan(is_space).u8_pos;
            return Token::Space(&source.source[s_pos..e_pos]);
        }
        _ if is_newline(start) => {
            let e_pos = source.scan(is_newline).u8_pos;
            return Token::NewLine(&source.source[s_pos..e_pos]);
        }
        _ if is_az(start) => {
            let e_pos = source.scan(|b| is_az(b) || is_digit(b)).u8_pos;
            return Token::Word(&source.source[s_pos..e_pos]);
        }
        b'.' => Token::Dot,
        b => Token::Byte(b),
    };
}

// impl<'scan, 'src> BaseTokenizer<Token<'src>> for Tokenizer<'scan, 'src> {
//     fn is_eof(&self) -> bool {
//         source.is_eof()
//     }

//     fn get_u16pos(&self) -> U16Position {
//         source.get_u16pos()
//     }

//     fn next(&mut self) -> Token<'src> {
//         if source.is_eof() {
//             return Token::None;
//         }

//         let s_pos = source.pos;
//         let start = source.source[source.pos];
//         self.source.forward(1);

//         return match start {
//             b'{' => Token::CurlyOpen,
//             b'}' => Token::CurlyClose,
//             b'[' => Token::SquareOpen,
//             b']' => Token::SquareClose,
//             b'(' => Token::ParenOpen,
//             b')' => Token::ParenClose,
//             b',' => Token::Comma,
//             b':' => Token::Colon,
//             b'/' => {
//                 if self.source.peek(0) == Some(b'*') {
//                     // eat *
//                     self.source.forward(1);

//                     // Look for /**
//                     if self.source.peek(0) == Some(b'*') {
//                         self.source.forward(1);
//                         return Token::DoccoStart;
//                     }

//                     // Eat the entire comment
//                     while !self.source.is_eof() {
//                         let curr = self.source.source[self.source.pos];
//                         if curr == b'*' && self.source.peek(1) == Some(b'/') {
//                             let e_pos = self.source.pos + 2;
//                             self.source.forward(2);
//                             return Token::MultiLineComment(&self.source.source[s_pos..e_pos]);
//                         }
//                         self.source.forward(1);
//                     }

//                     // TODO - this should be more descriptive
//                     Token::None
//                 } else {
//                     Token::Backslack
//                 }
//             }
//             b'\"' | b'\'' => {
//                 while !self.source.is_eof() {
//                     let mut curr = self.source.source[self.source.pos];

//                     // escape next
//                     if curr == b'\\' {
//                         self.source.forward(2);
//                         curr = self.source.source[self.source.pos];
//                     }

//                     self.source.forward(1);

//                     if curr == start {
//                         break;
//                     }
//                 }

//                 return Token::String(&self.source.source[s_pos..self.source.pos]);
//             }
//             _ if is_space(start) => {
//                 let e_pos = self.source.scan(is_space).u8_pos;
//                 return Token::Space(&self.source.source[s_pos..e_pos]);
//             }
//             _ if is_newline(start) => {
//                 let e_pos = self.source.scan(is_newline).u8_pos;
//                 return Token::NewLine(&self.source.source[s_pos..e_pos]);
//             }
//             _ if is_az(start) => {
//                 let e_pos = self.source.scan(|b| is_az(b) || is_digit(b)).u8_pos;
//                 return Token::Word(&self.source.source[s_pos..e_pos]);
//             }
//             b'.' => Token::Dot,
//             b => Token::Byte(b),
//         };
//     }
// }

// impl<'scan, 'src> Tokenizer<'scan, 'src> {
//     pub fn new(source: &'scan mut StringScanner<'src>) -> Tokenizer<'scan, 'src> {
//         Tokenizer { source }
//     }
// }

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
    fn can_tokenize_multiline_comment() {
        let mut scanner = StringScanner::new("hello/*gfdfdsfsd*//**abba");
        assert_eq!(next_token(&mut scanner), Token::Word(b"hello"));
        assert_eq!(next_token(&mut scanner), Token::MultiLineComment(b"/*gfdfdsfsd*/"));
        assert_eq!(next_token(&mut scanner), Token::DoccoStart);
        assert_eq!(next_token(&mut scanner), Token::Word(b"abba"));
    }
}
