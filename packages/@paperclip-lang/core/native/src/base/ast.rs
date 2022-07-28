use serde::Serialize;

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct U16Position {
    pub pos: usize,
    pub line: usize,
    pub column: usize,
}

impl U16Position {
    pub fn new(pos: usize, line: usize, column: usize) -> U16Position {
        U16Position {
            pos: pos,
            line: line,
            column: column,
        }
    }
    pub fn range_from(&self, pos: U16Position) -> Range {
        Range::new(self.clone(), pos)
    }
    pub fn range_to(&self, pos: U16Position) -> Range {
        Range::new(pos, self.clone())
    }
}

#[derive(Debug)]
pub struct Position {
    pub u8_pos: usize,
    pub u16_pos: usize,
    pub u16_line: usize,
    pub u16_column: usize,
}

impl Position {
    pub fn to_u16(&self) -> U16Position {
        U16Position {
            pos: self.u16_pos,
            line: self.u16_line,
            column: self.u16_column,
        }
    }
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Str {
    pub id: String,
    pub range: Range,
    pub value: String,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Number {
    pub id: String,
    pub range: Range,
    pub value: String,
}

#[derive(Debug, PartialEq, Serialize, Clone)]
pub struct Range {
    pub start: U16Position,
    pub end: U16Position,
}

impl Range {
    pub fn new(start: U16Position, end: U16Position) -> Range {
        Range { start, end }
    }
    pub fn nil() -> Range {
        Range::new(U16Position::new(0, 0, 0), U16Position::new(0, 0, 0))
    }
}
