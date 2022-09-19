use neon::prelude::*;
use std::cell::RefCell;
mod loader;

#[cfg(test)]
mod tests;

type BoxedEngine = JsBox<RefCell<Engine>>;

pub struct Engine {
    count2: i32
}

impl Finalize for Engine {

}

impl Engine {
    fn new() -> Self {
        Self {
            count2: 0
        }
    }
    fn inc(&mut self) {
        self.count2 += 1;
    }
}


fn engine_new(mut cx: FunctionContext) -> JsResult<BoxedEngine> {
    let engine = RefCell::new(Engine::new());
    Ok(cx.boxed(engine))
}


fn compile_file(mut cx: FunctionContext) -> JsResult<JsNumber> {
    let engine = cx.argument::<BoxedEngine>(0)?;
    let mut engine = engine.borrow_mut();
    engine.inc();
    Ok(cx.number(engine.count2))
}


#[neon::main]
fn main(mut cx: ModuleContext) -> NeonResult<()> {
    cx.export_function("startEngine", engine_new)?;
    cx.export_function("compileFile", compile_file)?;
    Ok(())
}