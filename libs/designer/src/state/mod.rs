use std::default::Default;

use crate::{events::AppEvent, shared::machine::core::Reducer};
use paperclip_proto::{service::designer::file_response::Data::Paperclip, virt::module::PcModule};
use std::collections::HashMap;
use url::Url;

#[derive(Default, Clone, Debug)]
pub struct AppState {
    pub current_file: Option<String>,
    pub current_module: Option<PcModule>,
}

impl Reducer<AppEvent> for AppState {
    fn reduce(&self, event: &AppEvent) -> Self {
        let mut clone = self.clone();

        match event {
            AppEvent::LocationChanged(url) => {
                let url = Url::parse(url).unwrap();
                let query: HashMap<_, _> = url.query_pairs().to_owned().collect();
                clone.current_file = if let Some(url) = query.get("file") {
                    Some(url.to_string())
                } else {
                    None
                };
            }
            AppEvent::FileLoaded(item) => {
                if let Some(data) = &item.data {
                    match data {
                        Paperclip(data) => {
                            clone.current_module = Some(data.clone());
                        }
                    }
                }
            }
        }
        clone
    }
}
