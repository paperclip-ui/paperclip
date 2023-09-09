// https://github.com/hyperium/tonic/blob/master/examples/src/hyper_warp/server.rs

use crate::server::{core::ServerEngineContext, io::ServerIO};
use anyhow::{Error, Result};
use inflector::cases::kebabcase::to_kebab_case;
use std::path::{Path, PathBuf};

// https://github.com/hyperium/tonic/blob/4b0ece6d2854af088fbc1bdb55c2cdd19ec9bb92/tonic-web/src/call.rs#L14
pub mod content_types {
    use http::{header::CONTENT_TYPE, HeaderMap};

    pub(crate) const GRPC_WEB: &str = "application/grpc-web";
    pub(crate) const GRPC_WEB_PROTO: &str = "application/grpc-web+proto";
    pub(crate) const GRPC_WEB_TEXT: &str = "application/grpc-web-text";
    pub(crate) const GRPC_WEB_TEXT_PROTO: &str = "application/grpc-web-text+proto";

    pub(crate) fn is_grpc_web(headers: &HeaderMap) -> bool {
        matches!(
            content_type(headers),
            Some(GRPC_WEB) | Some(GRPC_WEB_PROTO) | Some(GRPC_WEB_TEXT) | Some(GRPC_WEB_TEXT_PROTO)
        )
    }

    fn content_type(headers: &HeaderMap) -> Option<&str> {
        headers.get(CONTENT_TYPE).and_then(|val| val.to_str().ok())
    }
}

pub fn create_design_file<TIO: ServerIO>(
    name: &str,
    parent_dir: Option<String>,
    ctx: ServerEngineContext<TIO>,
) -> Result<String> {
    let config_ctx = ctx
        .store
        .lock()
        .unwrap()
        .state
        .options
        .config_context
        .clone();
    let src_dir = &parent_dir
        .or(config_ctx.config.designs_dir)
        .or(config_ctx.config.src_dir);

    let mut file_dir: PathBuf = Path::new(&config_ctx.directory).to_path_buf();

    file_dir = if let Some(src_dir) = src_dir {
        file_dir.join(src_dir)
    } else {
        file_dir
    };

    let file_path = file_dir
        // strip .pc from name in case it exists because we're already adding it.
        .join(format!("{}.pc", to_kebab_case(&name.replace(".pc", ""))))
        .to_str()
        .unwrap()
        .to_string();

    if ctx.io.file_exists(&file_path) {
        return Err(Error::msg("Design file already exists."));
    }

    println!("Created design file: {}", file_path);

    ctx.io.write_file(&file_path, "".to_string())?;

    Ok(file_path)
}
