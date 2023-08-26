use anyhow::Result;
use std::collections::HashMap;
use std::path::Path;
use std::sync::Arc;
use std::sync::Mutex;

use paperclip_common::fs::{FileReader, FileResolver};

#[derive(Clone)]
pub struct PCFileResolverOptions {
    pub embed_max_size: Option<u64>,
    pub asset_out_dir: Option<String>,
    pub asset_prefix: Option<String>,
}

#[derive(Clone)]
pub struct PCFileResolver<TReader: FileReader, TResolver: FileResolver> {
    pub resolved_paths: Arc<Mutex<HashMap<String, String>>>,
    pub reader: TReader,
    pub resolver: TResolver,
    pub options: PCFileResolverOptions,
}

impl<TReader: FileReader, TResolver: FileResolver> PCFileResolver<TReader, TResolver> {
    pub fn new(
        reader: TReader,
        resolver: TResolver,
        options: Option<PCFileResolverOptions>,
    ) -> Self {
        Self {
            reader,
            resolver,
            options: options.unwrap_or(PCFileResolverOptions {
                embed_max_size: None,
                asset_out_dir: None,
                asset_prefix: None,
            }),
            resolved_paths: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    fn resolve_contents(&self, full_path: &str) -> Result<String> {
        let size = self.reader.get_file_size(full_path)?;
        let exceeds_max_size = if let Some(max_size) = self.options.embed_max_size {
            size > max_size
        } else {
            false
        };

        
        if !exceeds_max_size {
            let mime = mime_guess::from_path(Path::new(&full_path)).first_or_octet_stream();
            let content = base64::encode(self.reader.read_file(full_path)?);
            return Ok(format!("data:{};base64,{}", mime, content));
        }

        return Ok(full_path.to_string());
    }
}

impl<TReader: FileReader, TResolver: FileResolver> FileResolver
    for PCFileResolver<TReader, TResolver>
{
    fn resolve_file(&self, from: &str, to: &str) -> Result<String> {
        let actual_path = self.resolver.resolve_file(from, to)?;

        let mut resolved_paths = self.resolved_paths.lock().unwrap();

        if let Some(contents) = resolved_paths.get(&actual_path) {
            return Ok(contents.clone());
        } else {

            let contents = self.resolve_contents(&actual_path)?;
            resolved_paths.insert(actual_path.to_string(), contents.clone());
            return Ok(contents);
        }
    }
}
