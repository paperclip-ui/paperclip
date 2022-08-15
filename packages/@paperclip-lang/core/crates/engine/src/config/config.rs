// From https://paperclip.dev/docs/configure-paperclip
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct Config {
    
    // source directory where *.pc files live
    #[serde(rename = "srcDir")]
    src_dir: Option<String>,

    // CSS globally injected into the page
    #[serde(rename = "globalCss")]
    global_css: Option<Vec<String>>,

    // directories where modules are stored
    #[serde(rename = "moduleDirs")]
    module_dirs: Option<String>,

    // options for the output settings
    #[serde(rename = "compilerOptions")]
    compiler_options: Vec<CompilerOptions>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct CompilerOptions {
    // target compiler to use. Default is all of the ones installed.
    target: Option<String>,

    // Files for the target compiler to emit. E.g: [d.ts, js, css]
    emit: Option<Vec<String>>,

    // where PC files should be compiled to. If undefined, then
    // srcDir is used.
    #[serde(rename = "outDir")]
    out_dir: Option<String>,

    // treat assets as modules. This is particularly useful for bundlers.
    #[serde(rename = "importAssetsAsModule")]
    import_assets_as_modules: Option<bool>,

    // Combine all CSS into this one file. If unspecified, then CSS files are generated
    // for each PC file
    #[serde(rename = "mainCssFileName")]
    main_css_file_name: Option<String>,

    // embed assets until this size. If -1, then there is no limit
    #[serde(rename = "embedAssetMaxSize")]
    embed_asset_max_size: Option<i32>,

    // output directory for non-PC files. If not specified, then srcDir
    // will be used
    #[serde(rename = "assetOutDir")]
    asset_out_dir: Option<String>,

    // prefix for assets,
    #[serde(rename = "assetPrefix")]
    asset_prefix: Option<String>,

    #[serde(rename = "useAssetHashNames")]
    use_asset_hash_names: Option<String>,
}
