#### Immediate

- ability to set variants
  - combo variants
- ability to insert atoms (left sidebar)
- ability to set style mixins (left sidebar)
- ability to set trigger (left sidebar)

- slots should always be around
- ability to define variant
- remove absolutely positioned elements

  - test: line-through text decoration

- Layers

  - ability to insert style mixin
  - ability to insert atom

- Bugs / enhancements

  - ability to resize sidebars
  - \*\*Fix race condition when multiple async mutations happening. Need to happen in sequence
  - when pasting component, create an instance
  - shouldn't be able to delete children of instances
  - show title of frame

- LeftSidebar

  - Layers
    - ability to shift siblings around
    - ability to drop nodes in containers
    - prohibit instance nodes from being moved
      - show banner for this
    - slots should be front and center
    - render node should be combined with component
  - Symbols
    - ability to add token
    - ability to add mixin

- Style panel

  - tooltip for props
    - keep them sectioned (Layout, font-family)
  - ability to clear declarations
  - \*color picker
  - variables should show special UI - not typeable

- Right panel

  - props pane
    - \*ability to set attributes

- Canvas
  - ability to insert into slot

### MVP

- Style Panel

  - smart dropdown for individual tokens e.g: border: 1px solid red

- NPM installation

### Litmus

- ability to build UIs end-to-end

#### Warm up (30 min)

- split legacy reducer code

Easy wins:

- ability to rename layers

#### On-deck

- slots

  - use expr id to find virt node Ids and calc box around that

- ability to insert elements into slots
- ability to move elements around in the layers panel
- styles panel (vanilla)
- style overrides
- style tokens

  - mixins
  - atoms

### Polish

- Detach instances when components are deleted

## ga
