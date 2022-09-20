The design server is responsible for:

- Hosting the designer
- Hosting the VM
- Providing an API for inspecting the AST, as well as the VM Objects
- Handling edits and other commands (like saving)

It's used by:

- The CLI tool (via `paperclip designer`)
- The VS Code extension ()
