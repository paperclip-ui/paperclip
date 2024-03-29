use crc::crc32;

#[derive(Debug, Clone)]
pub struct IDGenerator {
    pub seed: String,
    pub count: u32,
}

impl IDGenerator {
    pub fn new(seed: String) -> IDGenerator {
        IDGenerator { seed, count: 0 }
    }

    pub fn new_id(&mut self) -> String {
        let id_count = self.count + 1;
        self.count = id_count;
        format!("{}-{}", self.seed, id_count)
    }
    pub fn new_seed(&mut self) -> String {
        self.new_id()
    }
}

pub fn get_document_id<'a>(url: &str) -> String {
    let mut buff = String::from(url);

    if !url.starts_with("file://") {
        buff = format!("file://{}", buff);
    }

    format!("{:x}", crc32::checksum_ieee(buff.as_bytes())).to_string()
}
