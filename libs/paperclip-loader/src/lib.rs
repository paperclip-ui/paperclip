use futures::executor::block_on;
use loader::Loader;
use neon::prelude::*;
use paperclip_project::io::LocalIO;
use std::cell::RefCell;
use std::rc::Rc;
mod loader;

#[cfg(test)]
mod tests;

type BoxedLoader = JsBox<RefCell<Loader<LocalIO>>>;

fn loader_new(mut cx: FunctionContext) -> JsResult<BoxedLoader> {
    let directory = cx.argument::<JsString>(0)?;
    let config_name = cx.argument::<JsString>(1)?;

    let loader = RefCell::new(block_on(Loader::<LocalIO>::start(
        directory.value(&mut cx).as_str(),
        config_name.value(&mut cx).as_str(),
        Rc::new(LocalIO {}),
    )).unwrap());

    Ok(cx.boxed(loader))
}

// fn compile_file(mut cx: FunctionContext) -> JsResult<JsNumber> {
//     let engine = cx.argument::<BoxedLoader>(0)?;
//     let mut engine = engine.borrow_mut();
//     engine.inc();
//     Ok(cx.number(engine.count2))
// }

#[neon::main]
fn main(mut cx: ModuleContext) -> NeonResult<()> {
    cx.export_function("startLoader", loader_new)?;
    Ok(())
}
