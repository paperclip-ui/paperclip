#### On-deck

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

#### Milestone: Flesh out entire UI

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
