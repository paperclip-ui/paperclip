use crate::base::string_scanner::{StringScanner};

pub enum Token<'src> {
  CommentStart,
  CommendEnd,
  At,
  Word(&'src [u8]),
  ParenOpen,
  ParenClose,
  Colon
}



pub fn parse_with_scanner<'src>(scanner: &'src mut StringScanner<'src>) {
  
}