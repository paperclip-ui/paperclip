#### On-deck

- Ditch signals

- Display live preview in designer using dominator
- look into libp2p instead

- build designer in WASM

  - get state machine to work
  - build PC compiler in rust

- ability to insert elements
  - show drag bounds
  - on mouse up, insert into active element
    - if start + end in element, then insert into that element
    - if start outside of element, then create frame
- ability to edit styles of elements
- ability to create components

...

- hotkey for inserting nodes
  - "e" for element
  - "t" for text

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
