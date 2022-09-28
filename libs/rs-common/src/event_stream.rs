use std::rc::Weak;
use std::default;
use futures::stream::{Stream};
use futures::task::{Poll, Context};
use futures_util::pin_mut;
use futures_util::stream::StreamExt;
use async_stream::stream;

trait Event {

}


struct Event2;

struct EventStream {

}

impl EventStream {
  fn dispatch_event() {
  }
  fn watch<'listener>(&mut self) -> impl Stream<Item = Event2>  {
    stream! {
      yield Event2 {}
    }
  }
  fn new() -> Self {
    Self {
    }
  }
}

#[cfg(test)] 
mod test{
    use super::EventStream;
    use super::Event;

  #[test]
  fn can_create_a_simple_observable() {
    struct Event1 {
      message: String
    }

    impl Event for Event1 {

    }

  }
}