use std::hash::{Hash, Hasher};
include!(concat!(env!("OUT_DIR"), "/ast.base.rs"));

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
            pos: self.u16_pos as u32,
            line: self.u16_line as u32,
            column: self.u16_column as u32,
        }
    }
}

impl U16Position {
    pub fn new(pos: usize, line: usize, column: usize) -> U16Position {
        U16Position {
            pos: pos as u32,
            line: line as u32,
            column: column as u32,
        }
    }
    pub fn range_from(&self, pos: U16Position) -> Range {
        Range::new(self.clone(), pos)
    }
    pub fn range_to(&self, pos: U16Position) -> Range {
        Range::new(pos, self.clone())
    }
}

impl Hash for U16Position {
    fn hash<H: Hasher>(&self, hasher: &mut H) {
        self.pos.hash(hasher);
        self.line.hash(hasher);
        self.column.hash(hasher);
    }
}

impl Range {
    pub fn new(start: U16Position, end: U16Position) -> Range {
        Range {
            start: Some(start),
            end: Some(end),
        }
    }
    pub fn nil() -> Range {
        Range::new(U16Position::new(0, 0, 0), U16Position::new(0, 0, 0))
    }
}

impl Hash for Range {
    fn hash<H: Hasher>(&self, hasher: &mut H) {
        self.start.hash(hasher);
        self.end.hash(hasher);
    }
}
