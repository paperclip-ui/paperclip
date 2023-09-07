Paperclip is a domain specific language for simple UI components. The design of it tries and strikes a balance between a format that supports an ideal designer experience (like Figma), along with being feature parity with HTML and CSS.

The goal for Paperclip is just to cover the _visuals_ of your app, and this mostly means just covering primitive or dumb components. I.e: they're logic-less.

Here's a very simple component that you can use in your app code:

```javascript
public component Message {
    render div {
        style {
            color: red
            font-size: Comic Sans
        }
        slot children
    }
}
```

Then in your app code, you can use this component like so:

```tsx
import { Message } from "./message.pc";

<Message>Hello!</Message>;
```

This is how you use Paperclip in a nutshell. Here's a bigger kitchen sink example of a Paperclip file:

```javascript

// Individual declaration that you can use in styles
public token fontFamily01 Inter, sans-serif

// A style mixin, or group of styles that you can use in your app
public style defaultFont {
    font-family: var(fontFamily01)
    font-size: 11px
}

public style mobileFont extends defaultFont {
    font-size: 14px
}

// A re-usable component
public component MenuItem {

    // A component variant that can be triggered by
    // CSS selectors.
    variant dark trigger {
        ".dark"
    }

    // You can also define media queries for variant triggers
    variant mobile trigger {
        "@media screen and (max-width: 400px)"
    }

    render li {
        style extends defaultFont {
            display: flex
            align-items: center
            background: #ccc
            justify-content: space-between
        }
        style variant dark {
            background: #333
            color: white
        }
        style variant mobile extends mobileFont
        div {
            slot leftContent {
                text "content to the left"
            }
        }
        div {
            style {
                opacity: 0.5
            }
            slot rigtContent {
                text "content to the right"
            }
        }
    }
}


MenuItem {
    insert leftContent {
        text "A menu item"
    }
    insert rightContent {
        text "some controls"
    }
}
```

## Basics

### Elements

Kitchen sink exmaple:

```javascript
div theNameOfMyElement (class: "pt-6 space-y-4", onClick: onClick) {
    span {
        style {
            color: red
        }
        text "Hello!"
    }
}
```

Some things to point out here:

- `div` is the element name
- `theNameOfMyElement` (optional) is the _name_ of my element which should be human friendly. This shows up in the designer, so be sure that that name is clear!
- `class`, and `onClick` are both attributes.
  - `class` is taking in a class here - it can be anything you want. E.g: Tailwind (which you can load into the designer)
  - `onClick` takes a references to a click function that can be hooked into app code
- Everything within `{}` is a child of the element

### Text

Text is expressed like so:

```javascript
text myLabel "Blah" {
    style {
        color: #F0F
    }
}
```

- `myLabel` is optional, but I recommend that you add it since it'll show up in the designer
- `"Blah"` is the actual text value
- text nodes can be styled by adding a `style` to the body. Note that in HTML this would cause the text node to be rendered as `<span>Blah</span>`. If `style` is _not_ present, then only `Blah` would be rendered.
- Only `style` can be present within a text's body.

### Style tokens

Tokens are useful if you're looking to create re-usable style "atoms" for your app. Typically things like colors, spacing, and typography are well suited for this.

Here's an example:

```javascript

// "public" indicates that this token can be used in other files
public token gray01 #333
public token gray02 #444

// Example usage
div {
    style {
        color: var(gray01)
    }
}
```

The syntax for this is `token [name] [value]`.

### Style mixins

Style mixins are re-usable blocks of styles. For example:

```javascript

// Create a re-usable style block
public style defaultFont {
    font-family: Inter, sans-serif
    font-size: 11px
    color: #333
}

div {

    // use the style block by extending an existing one with it
    style extends defaultFont {
        background: grey
        padding: 12px
    }
}
```

The syntax is: `style [name] { [declarations] }`. Note that style mixins must be
declared at the root of your document.

### Extending styles

you may extend a style with one or more style mixins. For example:

```javascript
div {
    style extends defaultFont, anotherStyle, andAnotherStyle {

    }
}
```

### Importing PC files into other PC files

You may import PC files into other PC files like so:

```javascript
import "./theme.pc" as theme

div {
    style {
        background: var(theme.backgroundColor)
        color: var(theme.foregroundColor)
    }
}

```

Then in `theme.pc`:

```javascript
public token foregroundColor #CFCFCF
public token backgroundColor #333
```

## Components

Components are re-usable building blocks. Here's an example of one:

```javascript
public component Test {
    render div {
        text "Hello world!"
    }
}

Test
Test
```

This would render `Hello world! Hello world!`, and can _also_ be imported into app code. For example:

```tsx
import { Test } from "./test.pc";
<Test />;
```

### Slots

Slots are areas of your component where you can insert children into. For example:

```javascript
public component Message {
    render div {
        style extends defaultFont
        slot children {
            text "Hello world!"
        }
    }
}


Message {

    // here we're inserting a text node into the slot
    insert children {
        text "something else"
    }
}

Message {

    // "children" is also a special name -- you may
    // omit it if you want to.
    text "something"
}

```

### Variants

Variants allow you to create variations of your UI. For example:

```javascript
import "./theme.pc" as theme

public component Button {

    // We can trigger variants with CSS selectors
    variant danger trigger {
        ".danger"
    }
    variant secondary trigger {
        ".secondary"
    }
    variant warning trigger {
        ".warning"
    }
    render button(class: class, onClick: onClick) {
        style variant secondary {
            background: var(theme.gray02)
        }
        style variant danger {
            background: red
            color: maroon
        }
        style {
            position: relative
            background: var(theme.blue02)
            border: 0px
            border-radius: var(theme.space02)
            padding: var(theme.space02) var(theme.space04)
            color: var(theme.gray0)
            cursor: pointer
        }
        slot children {
            text "a button"
        }
    }
}
```

A few things to point out:

- styles can be applied with `style variant [variant name]`
- variants can be triggered by CSS selectors and media queries

### Variant triggers

Variants can be triggered by any number of CSS selectors or media queries. For example:

```javascript
public component Page {
    variant mobile trigger {
        ".mobile"
        "@media screen and (max-width: 400px)"
    }
    render div(class: class) {
        style {
            font-size: 12px
        }
        style variant trigger {
            font-size: 32px
        }
    }
}
```

The `mobile` trigger above can be triggered _either_ by resizing the browser to triggger
the specified media query, _or_ by applying the ".mobile" class.

#### Combination variants

There may be some cases where you want _multiple_ variants to be applied in order to trigger a specific style. Here's how you do that:

```javascript
public component Something {
    variant a trigger {
        ".a"
    }
    variant b trigger {
        ".b"
    }
    variant c trigger {
        ".c"
    }
    render div {

        // Only applied with a, b, and c are active
        style variant a + b + c {
            color: red
        }
    }
}
```

here's another example:

```javascript
public component Button {
    variant v2 trigger {
        ".v2"
    }
    variant hover trigger {
        ".hover",
        ":hover"
    }

    render button(onClick: onClick) {
        style {
            background: var(theme.buttonBackground)
            color: var(theme.buttonColor)
        }
        style variant hover {
            background: var(theme.buttonHoverBackground)
            color: var(theme.buttonHoverColor)
        }

        // V2 Styles
        style variant v2 {
            background: var(theme.buttonV2Background)
            color: var(theme.buttonV2Color)
        }

        style variant v2 + hover {
            background: var(theme.buttonV2HoverBackground)
            color: var(theme.buttonV2HoverColor)
        }
    }
}
```
