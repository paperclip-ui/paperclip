### Considerations

- Try not to hand-write any new UI unless it's necessary for self-creation
- It's all important so do what makes sense immediately

- What's 0-1 look like?

  - slots
  - style panel
    - mixins
    - variants
  - properties
    - ability to define class
  - ability to convert element to component
  - ability to insert instances

- 1+
  - ability to re-organize slots
  - style overrides

#### On-deck

- style variants

  - ability to define variants
  - ability to define triggers - raw for now
  -

- instance style overrides (necessary for styling components)
- right-click -> convert to component

- Create color picker visually
  - copy + paste layers
  - right click -> convert to component
- filter options based on unit type

- Popover

  - max-height + scroll
  - scrollable component

- wire up select input

  - use enums
  - ability to connect props to tokens

- auto-complete text inputspi

- borders?
- backgrounds?

- mixins

- dropdown

  - filter UI
  - token UI

- ability to style text elements

- style panel

  - tokens (we should basically just be using these anyways)
    - display options within dropdown
  - ability to define mixins
  - override styles
  - variants

- ## triggers

#### MVP

- Litmus:

  - can the entire AST be edited visually? What's the shortest path to get here?

- ability to edit projects online

  -

  - ## layers

- make persisting boundary styles cleaner

- ability to drag elements around according to parent pos
- set style on instance roots

- style panel
- ability to insert frames into each other
- ability to change frame styles (do style pane)

- start on style panel

- insert elements

  - "e" key to insert element

- ability to insert elements

  - show drag bounds
  - on mouse up, insert into active element
    - if start + end in element, then insert into that element
    - if start outside of element, then create frame

- ability to edit styles of elements
- ability to create components

...

- hotkey for inserting nodes
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
