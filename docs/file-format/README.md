Paperclip comes with a file format that's designed for the editor and can also be written by hand. Here's an example of it:

```javascript

// Tokens allow you to store individual CSS values that you can
// re-use throughout your app
token fontFamilyDefault Helvetica

token fontSize01 1rem

// You can create re-usable style mixins too
style fontDefault {
  font-family: var(fontFamilyDefault)
  font-size: var(fontSize01)
}

// re-usable blocks of elements
public component TodoItem {
  render li {
    slot children
  }
}

public component TodoItems {
  render ol {
    style extends fontDefault
    slot children
  }
}

// You may preview your instances like so
TodoItems {
  TodoItem {
    text "buy milk"
  }
  TodoItem {
    text "wash car"
  }
}
```

The file format is a _bit_ like HTML and CSS with a few distinctions:

- **There is no global CSS**. Styles are defined directly on elements instead. If you want to reuse styles, then you can define tokens, components, or mixins.
- **Triggers instead of selectors**. Paperclip uses the concept of [variants](#variants) and [triggers](#triggers) instead.
- **Text can have styles**. For example `text "hello world" { style: { color: red }}`. This feature exists for people that want to disallow the use of cascading styles.

## Syntax

### variants

### triggers

### mixins
