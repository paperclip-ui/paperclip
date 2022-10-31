use std::sync::Arc;

use crate::{shared::machine::core::{Machine, GroupEngine}, events::AppEvent, state::AppState};


pub type AppMachine = Arc<Machine<AppEvent, AppState, GroupEngine<AppEvent, AppState>>>;