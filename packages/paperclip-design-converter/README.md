CLI tool for converting design files (currently only supports sketch) to Paperclip. Video demo: https://www.youtube.com/watch?v=Ofqkcwc-eKE&feature=youtu.be

Example:

```bash
# convert static designs to paperclip component
paperclip-design-converter path/to/design/file.sketch > path/to/tandem/component.pc

# convert just style mixins
paperclip-design-converter path/to/design/file.sketch --only-style-mixins > path/to/tandem/mixins.pc

# convert only symbols
paperclip-design-converter path/to/design/file.sketch --only-symbols --write=path/to/component/dir

# convert style mixins & symbols
paperclip-design-converter path/to/design/file.sketch --only-symbols --only-style-mixins --write=path/to/component/dir

# convert only clobal color swatches
paperclip-design-converter path/to/design/file.sketch --only-colors > --write=path/to/component/dir

# only convert icons
paperclip-design-converter path/to/design/file.sketch --only-exports --write=path/to/component/dir

# also works with figma
paperclip-design-converter eBjqeLULnzNdsruu8J66Mx9w --figma-token=abcde --write=path/to/component/dir --mixin-label-pattern="[MIXIN]"
```

#### CLI Options

- `no-style-mixins` - convert only style mixins
- `no-components` - convert only symbols
- `mixin-label-pattern` - Elevate layers to mixins with this pattern.
- `no-pages` - do not generate pages component file

####
