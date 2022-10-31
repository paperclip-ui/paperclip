use std::{
    rc::Rc,
    sync::{Arc, Mutex}, fmt::Debug,
};

use futures_signals::signal::Mutable;
use gloo::console::console;
use wasm_bindgen_futures::spawn_local;

pub trait Reducer<Event>: Clone {
    fn reduce(&self, event: &Event) -> Self;
}

pub trait Dispatcher<Event> {
    fn dispatch(&self, event: Event);
}

pub trait Engine<Event, State> {
    fn on_event(&self, event: &Event, new_state: &State, old_state: &State) {}
    fn start(self: Arc<Self>) {}
}

#[derive(Debug)]
pub struct Machine<Event, State, TEngine>
where
    TEngine: Engine<Event, State>,
    State: Reducer<Event>,
{
    pub state: Arc<Mutable<State>>,
    engine_rx: flume::Receiver<Event>,
    engine: Arc<TEngine>,
}

impl<Event, State, TEngine> PartialEq for Machine<Event, State, TEngine>  where
TEngine: Engine<Event, State>,
State: Reducer<Event> {
 fn eq(&self, other: &Self) -> bool {
     false
 }
}

pub struct EngineDispatcher<Event> {
    tx: flume::Sender<Event>,
}

impl<Event> Dispatcher<Event> for EngineDispatcher<Event> {
    fn dispatch(&self, event: Event) {
        self.tx.send(event).unwrap();
    }
}

impl<Event: 'static, State: Debug, TEngine> Machine<Event, State, TEngine>
where
    TEngine: Engine<Event, State> + 'static,
    State: Reducer<Event> + 'static,
{
    pub fn new<EngineCtor>(state: State, engine_ctor: EngineCtor) -> Arc<Self>
    where
        EngineCtor: Fn(Rc<EngineDispatcher<Event>>) -> Arc<TEngine>,
    {
        let (engine_tx, engine_rx) = flume::unbounded();

        let engine = engine_ctor(Rc::new(EngineDispatcher { tx: engine_tx }));

        Arc::new(Self {
            engine_rx,
            state: Arc::new(Mutable::new(state)),
            engine,
        })
    }
    pub fn start(self: &Arc<Self>) {
        let clone = self.clone();
        spawn_local(async move {
            while let Ok(event) = clone.engine_rx.recv_async().await {
                let clone2 = clone.clone();
                spawn_local(async move {
                    clone2.dispatch(event);
                });
            }
        });

        self.engine.clone().start();
    }
    pub fn get_state(&self) -> Arc<Mutable<State>> {
        self.state.clone()
    }
}

impl<Event, State: Reducer<Event> + Debug, TEngine: Engine<Event, State>> Dispatcher<Event>
    for Machine<Event, State, TEngine>
{
    fn dispatch(&self, event: Event) {
        let (new_state, old_state) = {
            let old_state = self.state.replace_with(|state| {
                state.reduce(&event)
            });

            console!(format!("{:?}", self.state.get_cloned()));
            // let new_state = curr_state.reduce(&event);
            // let old_state = self.state.replace_with(new_state);
            // let old_state = std::mem::replace(&mut *curr_state, new_state.clone());
            let new_state: State = self.state.get_cloned();
            (new_state, old_state)
        };

        self.engine.on_event(&event, &new_state, &old_state);
    }
}

pub struct GroupEngine<Event, State> {
    engines: Vec<Arc<dyn Engine<Event, State>>>,
}

type EngineCtor<Event, State> =
    Box<dyn Fn(Rc<EngineDispatcher<Event>>) -> Arc<dyn Engine<Event, State>>>;

impl<Event, State> GroupEngine<Event, State> {
    pub fn new(
        dispatcher: Rc<EngineDispatcher<Event>>,
        engine_ctors: Vec<EngineCtor<Event, State>>,
    ) -> Self {
        Self {
            engines: engine_ctors
                .iter()
                .map(|ctor| (ctor)(dispatcher.clone()))
                .collect(),
        }
    }
}

impl<Event, State> Engine<Event, State> for GroupEngine<Event, State> {
    fn on_event(&self, event: &Event, new_state: &State, old_state: &State) {
        for engine in &self.engines {
            engine.on_event(event, new_state, old_state);
        }
    }
    fn start(self: Arc<Self>) {
        for engine in &self.engines {
            engine.clone().start();
        }
    }
}
