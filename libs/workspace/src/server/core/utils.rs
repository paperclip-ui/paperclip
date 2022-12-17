use std::path::PathBuf;

pub fn tmp_screenshot_dir() -> PathBuf {

  std::env::temp_dir()
  .join("paperclip/screenshots")
  

}