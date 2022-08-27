#### Milestone 1: parser

- CLI tool
- scan entire dependency graph
- use threads for parser
- crates/cli
  - load GLOB
  - start on compiler

#### Milestone 2: evaluator

- CSS evaluator

  - walk AST and emit CSS
    - use names if present
  - ensure that tokens are evaluated

- HTML evaluator

- save HTML to disc
- IO watcher - HMR?
- ability to inject components

  - react hooks?
    - can create adapter

- Preview
  - trpc?

#### Milestone 3: compiler

- React-based compiler
- vanilla compiler for CSS
