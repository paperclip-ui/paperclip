use paperclip_common::{get_or_short, join_path};
use paperclip_core::config::{CompilerOptions, ConfigContext};

#[derive(Clone)]
pub struct TargetCompilerContext {
    pub options: CompilerOptions,
    pub config_context: ConfigContext,
}

impl TargetCompilerContext {
    pub fn get_main_css_file_path(&self) -> Option<String> {
        let main_css_file_name = get_or_short!(&self.options.main_css_file_name, None);
        let asset_out_dir = self.get_asset_out_dir_path();

        Some(join_path!(&asset_out_dir, main_css_file_name.clone()))
    }

    pub fn get_out_dir_path(&self) -> String {
        if let Some(out_dir) = &self.options.out_dir {
            join_path!(&self.config_context.directory, out_dir.to_string())
        } else {
            self.get_src_dir_path()
        }
    }

    pub fn get_src_dir_path(&self) -> String {
        join_path!(
            &self.config_context.directory,
            if let Some(src_dir) = &self.config_context.config.src_dir {
                src_dir.to_string()
            } else {
                ".".to_string()
            }
        )
    }

    pub fn resolve_out_file(&self, path: &str) -> String {
        path.replace(
            self.get_src_dir_path().as_str(),
            self.get_out_dir_path().as_str(),
        )
        .to_string()
    }

    pub fn get_asset_out_dir_path(&self) -> String {
        if let Some(part) = &self.options.asset_out_dir {
            join_path!(&self.get_root_dir(), part)
        } else {
            self.get_out_dir_path()
        }
    }

    pub fn get_root_dir(&self) -> String {
        join_path!(&self.config_context.directory, self.options.get_root_dir())
    }

    pub fn resolve_asset_out_file(&self, path: &str, relative: bool) -> String {
        let new_path = path
            .replace(
                self.get_src_dir_path().as_str(),
                self.get_asset_out_dir_path().as_str(),
            )
            .to_string();

        if relative {
            new_path.replace(&self.get_root_dir(), "")
        } else {
            new_path
        }
    }
}
