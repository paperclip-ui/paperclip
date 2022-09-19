#### On-deck

- definition compiler
- publish VS Code extension for new name
- paperclip-loader
- React compiler (needed to start on designer)
  - emit jsx
  - Vanilla for now
  - Look into targeting radix
- `paperclip designer` command
  - open preview
  - possibly using GRPC for syncing data
    - add socket file locally based on paperclip.config.json?
    - VS Code listen on socket + realtime updates?
      - need to include IO for GRPC
      - watcher needs to emit changes

#### Milestone: MVP UI

Minimum number of things to get to polished state of entire UI

- right panel
- left panel
  - file navigator
  -
- canvas
  - just preview

#### Milestone: UI Feedback

#### Milestone: Wire up UI

#### Considerations

- loading PC files from other packages
  - resolve path of compiled output
    - this only works if compile targets are the same, so we'll need to check
- possibly use grid view for components instead of file system?

#### Milestone: online editing

- should be able to navigate to designer online
- pick any PC file
