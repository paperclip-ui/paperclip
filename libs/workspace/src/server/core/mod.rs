use std::sync::Arc;

use crate::machine::engine::EngineContext;
use crate::machine::store::Store;
pub mod event;
pub mod event_handler;
pub mod state;
pub use event::*;
pub use event_handler::*;
pub use state::*;
pub mod utils;

pub type ServerEngineContext<TIO> =
    Arc<EngineContext<ServerState, ServerEvent, TIO, ServerStateEventHandler>>;
pub type ServerStore = Store<ServerState, ServerEvent, ServerStateEventHandler>;
