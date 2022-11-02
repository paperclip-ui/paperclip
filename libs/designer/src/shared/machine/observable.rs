use std::{rc::{Weak, Rc}, cell::RefCell, borrow::Borrow};

pub struct Observable<T: PartialEq> {
  value: Rc<T>,
  observers: Vec<Weak<dyn Observer<T>>>
}

type Disposable = dyn Fn() + 'static;
type Select<T, V> = dyn Fn(&T, &T) -> V;

impl<T: PartialEq + Clone> Observable<T> {
  pub fn new(value: T) -> Self {
    Self {
      value: Rc::new(value),
      observers: vec![]
    }
  }
  pub fn select<V, TSelect>(&mut self, select: TSelect) -> Rc<Selector<T, V>> where TSelect: Fn(&T) -> V + 'static {
    let selector = Selector::new(select, self.value.clone());
    selector.into()
  }

  pub fn update<TUpdate>(&mut self, update: TUpdate) where TUpdate: Fn(&mut T) {

    let mut new_value = (*self.value).clone();
    update(&mut new_value);


    let prev = std::mem::replace(&mut self.value, new_value.into());
    
    for observer in &self.observers {
      if let Some(observer) = observer.upgrade() {
        observer.handle_change(&self.value);
      }
    }
  }
}

trait Observer<T> {
  fn handle_change(&self, curr: &T);
}

pub struct Selector<T, V> {
  value: Rc<RefCell<V>>,
  select: Box<dyn Fn(&T) -> V>,
  binding: RefCell<Option<Box<dyn Fn(&V)>>>
}

impl<T, V: PartialEq> Observer<T> for Selector<T, V> {
  fn handle_change(&self, curr: &T) {
    let new_value = (self.select)(curr);
    let old_value: &V = &self.value.borrow();
    if &new_value == old_value {
      return;
    }
    self.value.replace(new_value);
    let binding = &self.binding.borrow();

    if let Some(binding) = &binding {
      
    }
  }
}

impl<T, V> Selector<T, V> {
  pub fn new<TSelect>(select: TSelect, state: Rc<T>) -> Self where TSelect: Fn(&T) -> V + 'static {
    Self {
      value: Rc::new(RefCell::new((select)(&state))),
      select: Box::new(select),
      binding: RefCell::new(None)
    }
  }
  pub fn bind<Callback>(&self, callback: Callback) where Callback: Fn(&V) + 'static {
    (callback)(&self.value.borrow());
    self.binding.borrow_mut().replace(Box::new(callback));
  }
}