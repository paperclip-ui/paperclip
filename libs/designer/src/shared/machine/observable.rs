type Selector<T, V> = dyn Fn(T) -> V;


pub struct Observable<T> {
  value: T,
  listeners: Vec<Box<dyn Observer<T>>>
}

impl<T: PartialEq> Observable<T> {
  pub fn bind<Callback>(callback: Callback) -> SelectObserver<T, T> where Callback: Fn(T) -> () {
    SelectObserver {
      select: Box::new(|v| {
        v
      }),
      callback: Box::new(callback)
    }
  }
  pub fn bind_select<Callback, V>(callback: Callback, select: Selector<T, V>) {
    SelectObserver {
      select: Box::new(|v| {
        v
      }),
      callback: Box::new(callback)
    }

  }
  pub fn update(&mut self) {

  }
}

trait Observer<T> {
  fn handle_change(&self, curr: T, prev: T);
}

pub struct SelectObserver<T: PartialEq, V: PartialEq> {
  select: Box<dyn Fn(T) -> V>,
  callback: Box<dyn Fn(V) -> ()>
}
impl<T: PartialEq, V: PartialEq> SelectObserver<T, V> {
  pub fn on_change()
}

impl<T: PartialEq, V: PartialEq> Observer<T> for SelectObserver<T, V> {
  fn handle_change(&self, value: T, prev: T) {
    let curr_selected = (self.select)(value);
    let prev_selected = (self.select)(prev);
    if (curr_selected == prev_selected) {
      return;
    }
    (self.callback)(curr_selected);
  }
}