use futures::executor::block_on;
use loader::Loader;
use neon::prelude::*;
use paperclip_validate::print::ToPrettyString;
use std::cell::RefCell;

mod loader;
extern crate neon_serde3;

#[cfg(test)]
mod tests;

type BoxedLoader = JsBox<RefCell<Loader>>;

fn loader_new(mut cx: FunctionContext) -> JsResult<BoxedLoader> {
    let directory = cx.argument::<JsString>(0)?;
    let config_name = cx.argument::<JsString>(1)?;

    let loader = RefCell::new(
        Loader::start(
            directory.value(&mut cx).as_str(),
            config_name.value(&mut cx).as_str(),
        )
        .unwrap(),
    );

    Ok(cx.boxed(loader))
}

fn get_config_context(mut cx: FunctionContext) -> JsResult<JsValue> {
    let loader = cx.argument::<BoxedLoader>(0)?;

    let config = loader.borrow().get_config_context().clone();

    neon_serde3::to_value(&mut cx, &config).or_else(|e| cx.throw_error(e.to_string()))
}

fn compile_file(mut cx: FunctionContext) -> JsResult<JsObject> {
    let loader = cx.argument::<BoxedLoader>(0)?;
    let file_path = cx.argument::<JsString>(1)?;

    let files = block_on(
        loader
            .borrow()
            .compile_file(file_path.value(&mut cx).as_str()),
    );

    match files {
        Ok(files) => {
            let ret: Handle<JsObject> = cx.empty_object();

            for (key, content) in files {
                if let Ok(content) = std::str::from_utf8(&content) {
                    let value = cx.string(content);
                    ret.set(&mut cx, key.as_str(), value)?;
                }
            }

            Ok(ret)
        }
        Err(err) => {
            println!("{}", err.to_pretty_string());

            cx.throw_error("Unexpected error. See above.".to_string())
        }
    }
}

#[neon::main]
fn main(mut cx: ModuleContext) -> NeonResult<()> {
    cx.export_function("startLoader", loader_new)?;
    cx.export_function("getConfigContext", get_config_context)?;
    cx.export_function("compileFile", compile_file)?;
    Ok(())
}
