use futures::executor::block_on;
use loader::Loader;
use neon::prelude::*;
use paperclip_project::LocalIO;
use std::cell::RefCell;
use std::rc::Rc;
mod loader;

#[cfg(test)]
mod tests;

type BoxedLoader = JsBox<RefCell<Loader<LocalIO>>>;

fn loader_new(mut cx: FunctionContext) -> JsResult<BoxedLoader> {
    let directory = cx.argument::<JsString>(0)?;
    let config_name = cx.argument::<JsString>(1)?;

    let loader = RefCell::new(
        Loader::<LocalIO>::start(
            directory.value(&mut cx).as_str(),
            config_name.value(&mut cx).as_str(),
            Rc::new(LocalIO {}),
        )
        .unwrap(),
    );

    Ok(cx.boxed(loader))
}

fn compile_file(mut cx: FunctionContext) -> JsResult<JsObject> {
    let loader = cx.argument::<BoxedLoader>(0)?;
    let file_path = cx.argument::<JsString>(1)?;

    let files = block_on(
        loader
            .borrow()
            .compile_file(file_path.value(&mut cx).as_str()),
    )
    .unwrap();

    let ret: Handle<JsObject> = cx.empty_object();

    for (key, content) in files {
        let value = cx.string(content.to_string());
        ret.set(&mut cx, key.as_str(), value)?;
    }

    Ok(ret)
}

#[neon::main]
fn main(mut cx: ModuleContext) -> NeonResult<()> {
    cx.export_function("startLoader", loader_new)?;
    cx.export_function("compileFile", compile_file)?;
    Ok(())
}
