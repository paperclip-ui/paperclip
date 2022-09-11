use std::error::Error;
use std::fmt;

#[derive(Debug, PartialEq, Clone)]
pub struct RuntimeError {
    pub message: String,
}

impl fmt::Display for RuntimeError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "{}", self.message)
    }
}

impl Error for RuntimeError {
    fn description(&self) -> &str {
        &self.message
    }
}
