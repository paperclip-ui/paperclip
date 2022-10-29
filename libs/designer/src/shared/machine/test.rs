use wasm_bindgen_test::*;

use super::core::{Dispatcher, Engine, Machine, Reducer};

enum Event {
    Inc(i32),
    SomeSideEffect(i32),
}

#[derive(Clone, Debug, PartialEq)]
struct State {
    count: i32,
    sum: i32,
}

impl Reducer<Event> for State {
    fn reduce(&self, event: &Event) -> Self {
        match event {
            Event::Inc(amount) => Self {
                count: self.count + amount,
                ..*self
            },
            Event::SomeSideEffect(amount) => Self {
                count: self.sum + amount,
                ..*self
            },
        }
    }
}

struct AppEngine<Event> {
    tx: flume::Sender<Event>,
}

impl Engine<Event, State> for AppEngine<Event> {
    fn on_event(&self, event: &Event, state: &State, prev_state: &State) {
        if matches!(event, Event::Inc(_)) {
            self.tx
                .send(Event::SomeSideEffect(state.count + prev_state.count))
                .unwrap();
        }
    }
}

#[wasm_bindgen_test]
pub async fn can_create_a_simple_machine() {
    let machine = Machine::new(State { count: 0, sum: 0 }, |tx| AppEngine { tx });
    machine.start().await;
    machine.dispatch(Event::Inc(1));

    async {
        assert_eq!(
            machine.get_state().lock().unwrap().clone(),
            State { count: 1, sum: 0 }
        );
    }
    .await;

    async {
        assert_eq!(
            machine.get_state().lock().unwrap().clone(),
            State { count: 1, sum: 0 }
        );
    }
    .await;
}
