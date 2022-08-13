// From https://paperclip.dev/docs/configure-paperclip

pub struct Config {
    // source directory where *.pc files live
    src_dir: Option<String>,

    // CSS globally injected into the page
    global_css: Option<Vec<String>>,

    // directories where modules are stored
    module_dirs: Option<String>,

    // options for the output settings
    compiler_options: Vec<CompilerOptions>,
}

pub struct CompilerOptions {
    // target compiler to use. Default is all of the ones installed.
    target: Option<String>,

    // Files for the target compiler to emit. E.g: [d.ts, js, css]
    emit: Option<Vec<String>>,

    // where PC files should be compiled to. If undefined, then
    // srcDir is used.
    out_dir: Option<String>,

    // treat assets as modules. This is particularly useful for bundlers.
    import_assets_as_modules: Option<bool>,

    // Combine all CSS into this one file. If unspecified, then CSS files are generated
    // for each PC file
    main_css_file_name: Option<String>,

    // embed assets until this size. If -1, then there is no limit
    embed_asset_max_size: Option<i32>,

    // output directory for non-PC files. If not specified, then srcDir
    // will be used
    asset_out_dir: Option<String>,

    // prefix for assets,
    asset_prefix: Option<String>,

    use_asset_hash_names: Option<String>,
}
