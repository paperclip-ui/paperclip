the HTML interimediary module provides a more consumable format for web-based translators. Here's some rough pseudocode
around how this works:

```rust
use crate::paperclip_interim::translate_interim;
use crate::paperclip_evaluator::evaluate_pc;
use crate::paperclip_react_compiler::compile_react;
use crate::paperclip_parser::parse_pc;

let interim = translate_interim(parse_pc(r#"
  public component Test {
    render div {

    }
  }
"#));


```

Struct for interim module might be:

```rust
pub struct InterimModule {
  css
}
```
