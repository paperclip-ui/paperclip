// From https://paperclip.dev/docs/configure-paperclip
use anyhow::Result;
use paperclip_common::fs::FileReader;
use paperclip_common::join_path;
use serde::{Deserialize, Serialize};
use std::path::Path;
use std::str;
use ts_rs::TS;

pub const DEFAULT_CONFIG_NAME: &str = "paperclip.config.json";

///
/// Contains additional information about the config such as directory and file name
///

#[derive(Clone, Debug, Serialize, TS)]
#[ts(export)]
pub struct ConfigContext {
    pub directory: String,
    #[serde(rename = "fileName")]
    pub file_name: String,
    pub config: Config,
}

impl ConfigContext {
    pub fn get_global_script_paths(&self) -> Vec<String> {
        self.config
            .global_scripts
            .as_ref()
            .and_then(|rel_paths| {
                Some(
                    rel_paths
                        .iter()
                        .map(|rel_path| {
                            if rel_path.contains("://") {
                                rel_path.to_string()
                            } else {
                                join_path!(&self.directory, rel_path)
                            }
                        })
                        .collect::<Vec<String>>(),
                )
            })
            .unwrap_or(vec![])
    }

    pub fn load<FR: FileReader>(cwd: &str, file_name: Option<String>, io: &FR) -> Result<Self> {
        let file_name = if let Some(value) = file_name {
            value
        } else {
            DEFAULT_CONFIG_NAME.to_string()
        };

        let file_path = Path::new(cwd).join(file_name.to_string());

        let config = if file_path.exists() {
            let content = io.read_file(file_path.to_str().unwrap())?;
            let content = str::from_utf8(&*content).unwrap().to_string();
            serde_json::from_str::<Config>(content.as_str())?
        } else {
            Config::default()
        };

        Ok(ConfigContext {
            directory: cwd.to_string(),
            file_name: file_name.to_string(),
            config,
        })
    }
}

#[derive(Serialize, Deserialize, Debug, PartialEq, Clone, TS, Default)]
#[ts(export)]
pub struct Config {
    /// TRUE if experimental flags are enabled
    #[serde(skip_serializing_if = "Option::is_none")]
    pub experimental: Option<bool>,

    /// Global scripts that are injected into the page (JS, and CSS)
    #[serde(rename = "globalScripts", skip_serializing_if = "Option::is_none")]
    pub global_scripts: Option<Vec<String>>,

    /// source directory where *.pc files live
    #[serde(rename = "srcDir", skip_serializing_if = "Option::is_none")]
    pub src_dir: Option<String>,

    /// source directory where *.pc files live
    #[serde(rename = "designsDir", skip_serializing_if = "Option::is_none")]
    pub designs_dir: Option<String>,

    /// directories where modules are stored
    #[serde(rename = "moduleDirs", skip_serializing_if = "Option::is_none")]
    pub module_dirs: Option<Vec<String>>,

    /// options for the output settings
    #[serde(rename = "compilerOptions", skip_serializing_if = "Option::is_none")]
    pub compiler_options: Option<Vec<CompilerOptions>>,

    // /// options for the output settings
    #[serde(
        rename = "openCodeEditorCommandTemplate",
        skip_serializing_if = "Option::is_none"
    )]
    pub open_code_editor_command_template: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, PartialEq, Clone, TS)]
#[ts(export)]
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
        if &self.get_src_dir() == "." {
            return "**/*.pc".to_string();
        }

        String::from(
            Path::new(&self.get_src_dir())
                .join("**")
                .join("*.pc")
                .to_str()
                .unwrap(),
        )
    }

    pub fn load<FR: FileReader>(
        &self,
        cwd: &str,
        file_name: Option<String>,
        io: &FR,
    ) -> Result<Self> {
        let file_name = if let Some(value) = file_name {
            value
        } else {
            DEFAULT_CONFIG_NAME.to_string()
        };

        let file_path = Path::new(cwd).join(file_name.to_string());

        if file_path.exists() {
            let content = io.read_file(file_path.to_str().unwrap())?;
            let content = str::from_utf8(&*content).unwrap().to_string();
            Ok(serde_json::from_str::<Config>(content.as_str())?)
        } else {
            Err(anyhow::Error::msg("Config file not found"))
        }
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
