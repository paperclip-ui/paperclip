// From https://paperclip.dev/docs/configure-paperclip
use anyhow::Result;
use paperclip_common::fs::FileReader;
use serde::{Deserialize, Serialize};
use std::path::Path;
use std::str;

pub const DEFAULT_CONFIG_NAME: &str = "paperclip.config.json";

///
/// Contains additional information about the config such as directory and file name
///

#[derive(Clone, Debug)]
pub struct ConfigContext {
    pub directory: String,
    pub file_name: String,
    pub config: Config,
}

impl ConfigContext {
    pub fn load<FR: FileReader>(cwd: &str, file_name: Option<String>, io: &FR) -> Result<Self> {
        let file_name = if let Some(value) = file_name {
            value
        } else {
            DEFAULT_CONFIG_NAME.to_string()
        };

        let file_path = Path::new(cwd).join(file_name.to_string());
        let content = io.read_file(file_path.to_str().unwrap())?;

        let content = str::from_utf8(&*content).unwrap().to_string();

        let config = serde_json::from_str::<Config>(content.as_str())?;

        Ok(ConfigContext {
            directory: cwd.to_string(),
            file_name: file_name.to_string(),
            config,
        })
    }
}

#[derive(Serialize, Deserialize, Debug, PartialEq, Clone)]
pub struct Config {

    /// Global scripts that are injected into the page (JS, and CSS)
    #[serde(rename = "srcDir", skip_serializing_if = "Option::is_none")]
    pub global_scripts: Option<String>,

    /// source directory where *.pc files live
    #[serde(rename = "srcDir", skip_serializing_if = "Option::is_none")]
    pub src_dir: Option<String>,

    /// directories where modules are stored
    #[serde(rename = "moduleDirs", skip_serializing_if = "Option::is_none")]
    pub module_dirs: Option<Vec<String>>,

    /// options for the output settings
    #[serde(rename = "compilerOptions", skip_serializing_if = "Option::is_none")]
    pub compiler_options: Option<Vec<CompilerOptions>>,
}

#[derive(Serialize, Deserialize, Debug, PartialEq, Clone)]
pub struct CompilerOptions {
    /// Files for the target compiler to emit. E.g: [d.ts, js, css]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub emit: Option<Vec<String>>,

    /// where PC files should be compiled to. If undefined, then
    /// srcDir is used.
    #[serde(rename = "outDir", skip_serializing_if = "Option::is_none")]
    pub out_dir: Option<String>,

    /// treat assets as modules. This is particularly useful for bundlers.
    #[serde(
        rename = "importAssetsAsModule",
        skip_serializing_if = "Option::is_none"
    )]
    pub import_assets_as_modules: Option<bool>,

    /// Combine all CSS into this one file. If unspecified, then CSS files are generated
    /// for each PC file
    #[serde(rename = "mainCssFileName", skip_serializing_if = "Option::is_none")]
    pub main_css_file_name: Option<String>,

    /// embed assets until this size. If -1, then there is no limit
    #[serde(rename = "embedAssetMaxSize", skip_serializing_if = "Option::is_none")]
    pub embed_asset_max_size: Option<i32>,

    /// output directory for non-PC files. If not specified, then srcDir
    /// will be used
    #[serde(rename = "assetOutDir", skip_serializing_if = "Option::is_none")]
    pub asset_out_dir: Option<String>,

    /// prefix for assets,
    #[serde(rename = "assetPrefix", skip_serializing_if = "Option::is_none")]
    pub asset_prefix: Option<String>,

    #[serde(rename = "useAssetHashNames", skip_serializing_if = "Option::is_none")]
    pub use_asset_hash_names: Option<String>,
}

impl Config {
    pub fn get_src_dir(&self) -> String {
        if let Some(src_dir) = &self.src_dir {
            src_dir.to_string()
        } else {
            ".".to_string()
        }
    }
    pub fn get_relative_source_files_glob_pattern(&self) -> String {
        String::from(
            Path::new(&self.get_src_dir())
                .join("**")
                .join("*.pc")
                .to_str()
                .unwrap(),
        )
    }
}

impl CompilerOptions {
    pub fn can_emit(&self, extension: &str) -> bool {
        if let Some(exts) = &self.emit {
            exts.iter().find(|ext| ext.as_str() == extension) != None
        } else {
            false
        }
    }
}
