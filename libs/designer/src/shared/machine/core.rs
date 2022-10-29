use std::sync::{Arc, Mutex};

use wasm_bindgen_futures::spawn_local;

pub trait Reducer<Event>: Clone {
    fn reduce(&self, event: &Event) -> Self;
}

pub trait Dispatcher<Event> {
    fn dispatch(&self, event: Event);
}

pub trait Engine<Event, State> {
    fn on_event(&self, event: &Event, new_state: &State, old_state: &State);
}

pub struct Machine<Event, State, TEngine>
where
    TEngine: Engine<Event, State>,
    State: Reducer<Event>,
{
    pub state: Arc<Mutex<State>>,
    engine_rx: flume::Receiver<Event>,
    engine: TEngine,
}


pub struct EngineDispatcher<Event> {
    tx: flume::Sender<Event>
}

impl<Event> Dispatcher<Event> for EngineDispatcher<Event> {
    fn dispatch(&self, event: Event) {
        self.tx.send(event).unwrap();
    }
}


impl<Event: 'static, State, TEngine> Machine<Event, State, TEngine>
where
    TEngine: Engine<Event, State> + 'static,
    State: Reducer<Event> + 'static,
{
    pub fn new<EngineCtor>(state: State, engine_ctor: EngineCtor) -> Arc<Self>
    where
        EngineCtor: Fn(EngineDispatcher<Event>) -> TEngine,
    {
        let (engine_tx, engine_rx) = flume::unbounded();

        let engine = engine_ctor(EngineDispatcher { tx: engine_tx });

        Arc::new(Self {
            engine_rx,
            state: Arc::new(Mutex::new(state)),
            engine,
        })
    }
    pub async fn start(self: &Arc<Self>) {
        let clone = self.clone();
        spawn_local(async move {
            while let Ok(event) = clone.engine_rx.recv_async().await {
                let clone2 = clone.clone();
                spawn_local(async move {
                    clone2.dispatch(event);
                });
            }
        });
    }
    pub fn get_state(&self) -> Arc<Mutex<State>> {
        self.state.clone()
    }
}

impl<Event, State: Reducer<Event>, TEngine: Engine<Event, State>> Dispatcher<Event>
    for Machine<Event, State, TEngine>
{
    fn dispatch(&self, event: Event) {
        let (new_state, old_state) = {
            let mut curr_state = self.state.lock().unwrap();
            let new_state = curr_state.reduce(&event);
            let old_state = std::mem::replace(&mut *curr_state, new_state.clone());
            (new_state, old_state)
        };

        self.engine.on_event(&event, &new_state, &old_state);
    }
}
