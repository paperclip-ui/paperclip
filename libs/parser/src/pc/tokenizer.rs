// Inspired by https://github.com/servo/rust-cssparser/blob/master/src/tokenizer.rs
use crate::base::tokenizer::next_scanner_char;
use crate::core::errors as err;
use crate::core::string_scanner::{
    is_az, is_digit, is_newline, is_space, scan_string, Char, StringScanner,
};
use serde::Serialize;

#[derive(Debug, PartialEq, Serialize, Clone, Copy)]
pub enum Token<'src> {
    CurlyOpen,
    CurlyClose,
    ParenOpen,
    ParenClose,
    SquareOpen,
    SquareClose,
    Plus,
    Comma,
    Colon,
    Backslack,
    Dot,
    NewLine(&'src [u8]),
    MultiLineComment(&'src [u8]),
    DoccoStart,
    Space(&'src [u8]),
    Word(&'src [u8]),
    KeywordExtends,
    KeywordPublic,
    KeywordImport,
    KeywordComponent,
    KeywordVariant,
    String(&'src [u8]),
    Byte(u8),

    // Possibly glyphs
    Cluster(&'src [u8]),
}

pub fn next_token<'src>(source: &mut StringScanner<'src>) -> Result<Token<'src>, err::ParserError> {
    let s_pos = source.get_pos();
    let c = next_scanner_char(source)?;

    match c {
        Char::Byte(b) => {
            Ok(match b {
                b'{' => Token::CurlyOpen,
                b'}' => Token::CurlyClose,
                b'[' => Token::SquareOpen,
                b']' => Token::SquareClose,
                b'(' => Token::ParenOpen,
                b')' => Token::ParenClose,
                b'+' => Token::Plus,
                b',' => Token::Comma,
                b':' => Token::Colon,
                b'/' => {
                    if source.peek(0) == Some(b'*') {
                        // eat *
                        source.forward(1);

                        // Look for /**
                        if source.peek(0) == Some(b'*') {
                            source.forward(1);
                            Token::DoccoStart
                        } else {
                            next_comment(source, s_pos.u8_pos)?
                        }
                    } else {
                        Token::Backslack
                    }
                }
                b'\"' | b'\'' => Token::String(scan_string(source, b)),
                _ if is_space(b) => Token::Space(source.slice_until(s_pos.u8_pos, is_space)),
                _ if is_newline(b) => Token::NewLine(source.slice_until(s_pos.u8_pos, is_newline)),
                _ if is_az(b) => {
                    let word = source.slice_until(s_pos.u8_pos, |b| {
                        is_az(b) || is_digit(b) || matches!(b, b'-') || matches!(b, b'_')
                    });
                    match word {
                        b"extends" => Token::KeywordExtends,
                        b"public" => Token::KeywordPublic,
                        b"variant" => Token::KeywordVariant,
                        b"import" => Token::KeywordImport,
                        b"component" => Token::KeywordComponent,
                        _ => Token::Word(word),
                    }
                }
                b'.' => Token::Dot,
                b => Token::Byte(b),
            })
        }
        Char::Cluster(value) => Ok(Token::Cluster(value)),
    }
}

fn next_comment<'src>(
    source: &mut StringScanner<'src>,
    s_pos: usize,
) -> Result<Token<'src>, err::ParserError> {
    // Eat the entire comment
    while !source.is_eof() {
        let curr = source.source[source.pos];
        if curr == b'*' && source.peek(1) == Some(b'/') {
            let e_pos = source.pos + 2;
            source.forward(2);
            return Ok(Token::MultiLineComment(&source.source[s_pos..e_pos]));
        }
        source.forward(1);
    }

    Err(err::ParserError::new_eof())
}

pub fn is_superfluous(token: &Token) -> bool {
    matches!(token, Token::Space(_) | Token::MultiLineComment(_))
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
        assert_eq!(next_token(&mut scanner), Ok(Token::Word(b"hello")));
        assert_eq!(
            next_token(&mut scanner),
            Ok(Token::MultiLineComment(b"/*gfdfdsfsd*/"))
        );
        assert_eq!(next_token(&mut scanner), Ok(Token::DoccoStart));
        assert_eq!(next_token(&mut scanner), Ok(Token::Word(b"abba")));
    }
}
