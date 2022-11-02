use std::sync::Arc;

use crate::{
    events::AppEvent,
    shared::machine::core::{GroupEngine, Machine},
    state::AppState,
};

pub type AppMachine = Arc<Machine<AppEvent, AppState, GroupEngine<AppEvent, AppState>>>;
