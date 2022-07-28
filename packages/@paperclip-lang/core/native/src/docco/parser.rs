use crate::base::string_scanner::StringScanner;

pub fn parse<'a>(source: &'a str) {
    let mut scanner = StringScanner::new(source);
    parse_with_string_scanner(&mut scanner)
}

pub fn parse_with_string_scanner<'a>(source: &'a mut StringScanner) {}
