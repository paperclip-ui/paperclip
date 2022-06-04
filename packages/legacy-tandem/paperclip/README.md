Paperclip is DSL for building web UIs visually.

#### TODOS

- Move evaluator over to Rust
- SVG support
- Eliminate saga dependency
- Global variables
- Sketch loader

#### API Example

```javascript
import {
  createPCModule,
  createPCRuntime,
  renderSyntheticDocumentChanges,
  createPCComponent,
  createPCElement,
  createPCTextNode,
  createDependencyGraph,
  createPCComponentInstance,
} from "paperclip";

const component = createPCComponent("Test");

const pcModule = createPCModule([
  component,
  createPCComponentInstance(component.id),
]);

const graph = createDependencyGraph({
  "entry.pc": createPCDependency("entry.pc", pcModule),
});

const runtime = createPCRuntime();
runtime.on("evaluate", renderSyntheticDocumentChanges(document.body));

runtime.graph = graph;
```
