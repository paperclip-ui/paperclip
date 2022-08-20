```rust
use paperclip_runtime::runtime::{Runtime, LoadedData};

let mut runtime = Runtime::new();
let result: Result<LoadResult> = let runtime.load("/path/to/file.pc").await;

if let Ok(result) = result {

  // the evaluated document
  println("{:?}", result.document);

  // any diffs of the document
  println("{:?}", result.diffs);
}

```
