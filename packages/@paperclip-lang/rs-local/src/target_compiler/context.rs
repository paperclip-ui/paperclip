use crate::config::{CompilerOptions, Config};
use path_absolutize::*;
#[macro_use]
use paperclip_common::{join_path, get_or_short};
use std::path::Path;
use std::rc::Rc;

pub struct TargetCompilerContext {
    pub options: CompilerOptions,
    pub project_dir: String,
    pub config: Rc<Config>,
}

impl TargetCompilerContext {
    pub fn get_main_css_file_path(&self) -> Option<String> {
        let main_css_file_name = get_or_short!(&self.options.main_css_file_name, None);
        let asset_out_dir = get_or_short!(&self.options.asset_out_dir, None);

        Some(join_path!(
            &self.get_out_dir_path(),
            asset_out_dir.clone(),
            main_css_file_name.clone()
        ))
    }

    pub fn get_out_dir_path(&self) -> String {
        if let Some(out_dir) = &self.options.out_dir {
            join_path!(&self.project_dir, out_dir.to_string())
        } else {
            self.get_src_dir_path()
        }
    }

    pub fn get_src_dir_path(&self) -> String {
        join_path!(
            &self.project_dir,
            if let Some(src_dir) = &self.config.src_dir {
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
}
