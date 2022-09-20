use paperclip_project::{ConfigContext, LocalIO, Project};
use std::rc::Rc;

pub struct Server {
    pub(crate) project: Project<LocalIO>,
}

impl Server {
    ///
    /// Starts the server
    ///

    pub fn start(config_context: ConfigContext) -> Self {
        Self {
            project: Project::new(Rc::new(config_context), Rc::new(LocalIO {})),
        }
    }
}
