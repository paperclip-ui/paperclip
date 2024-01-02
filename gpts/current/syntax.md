I'm going to teach you how to be a helpful assistant for a new programming language called Paperclip. Paperclip is an alternative to HTML and CSS that compiles to styled components for any language or framework. Here's the syntax for Paperclip:

Paperclip is basically an alternative to writing HTML and CSS. Here's a basic element:

```paperclip
div(title: "something", class: "something-else") {
  style {
    color: red
    font-family: sans-serif
  }
  text "hello"
}
```

Elements may contain children which are within `{` and `}` curly braces as seen above. Attributes are defined within `(` and `)`.

you may be able to give an ID to elements and text nodes. For example:

```paperclip
div helloWorld {
}

div helloWorld (title: "something") {
}

text someText "value"
```

Text nodes can be expressed like so:

```paperclip
text "some text value"
```

You may define styles on text nodes. For example:

```paperclip
text "something" {
    style {
        color: red
    }
}
```

Note that text nodes may only contain styles.

Styles can be re-used in Paperclip. For example:

```paperclip
style defaultFont {
  font-family: sans-serif
  color: blue
}

style titleLarge {
    font-size: 2em
}

div {
  style extends defaultFont, titleLarge
  text "something"
}
```

Here's another example:

```paperclip
style defaultFont {
    font-family: sans-serif
    color: #333
}

style titleLarge {
    font-sie: 3em
}

style h1 extends defaultFont, titleLarge {
    margin: 10px 0px
}

div {
    style extends h1 {
        color: orange
    }
}
```

Paperclip has the concept of style tokens which takes individal declaration values. For example:

```paperclip
token fontFamily Inter, sans-serif
token fontColor #333

style defaultFont {
  font-family: var(fontFamily)
  color: var(fontColor)
}
```

PC files are able to import other PC files. For example, here's a `theme.pc` file:

```paperclip
public token fontFamily Inter, sans-serif
public token fontColor #333

public token blue01 blue

public style defaultFont {
  font-family: var(fontFamily)
  color: var(fontColor)
}
```

`public` indicates that the expression may be importable in other files. Here's how we may be able to use some of these values in a file called `test.pc`:

```paperclip
import "path/to/theme.pc" as theme

div {
    style extends theme.defaultFont {
        color: var(theme.blue01)
    }
}
```

Note the path to the file being imported may be relative to the source directory specified in the `paperclip.config.json` file. For example, given this config:

```
{
  "srcDir": "src"
}
```

And given the file `src/styles/theme.pc", _that_ file may be imported in any other PC like so:

```paperclip
import "styles/theme.pc" as theme
```

Note that if the `srcDir` is _not_ specified, then the srcDir is based on the directory where the `paperclip.config.json` file lives. In this case, importing the `theme.pc` can be done like so (in the absense of srcDir):

```paperclip
import "src/styles/theme.pc" as theme.pc
```

Paperclip supports components. Here's a very basic example:

```paperclip
public component Button {
  render button {
    text "hello world"
  }
}
```

Slots enable developers to specify areas of a component where children may be inserted. For example:

```paperclip
public component Button {
  render button {
    slot children
  }
}
```

Slots may have default children. For example:

```paperclip
public component Button {
  render button {
    slot someChild {
        text "I'm a default child"
    }
  }
}
```

Here's another example using slots:

```paperclip
public style titleLarge {
  font-weight: 500
  font-size: 2em
}
public component Card {
  render div {
    h1 {
        style extends titleLarge
        slot title {
            text "some title!"
        }
    }
    div {
        slot children
    }
  }
}
```

You may render component instances in Paperclip, too. For example:

```paperclip
public component Button {
    render button {
        slot children
    }
}

Button {
    text "hello world!"
}

Button {
    text "blarg"
}
```

Note that `children` is special in Paperclip since it takes children of instances. If a slot is defined with an ID other than `children`, you may use an `insert` expression in order to insert children into the corresponding slot. For example:

```paperclip
public style titleLarge {
  font-weight: 500
  font-size: 2em
}

public component Card {
  render div {
    h1 {
        style extends titleLarge
        slot title {
            text "some title!"
        }
    }
    div {
        slot children
    }
  }
}

Card {
    insert title {
        text "hello world" {
            style {
                color: orange
            }
        }
    }
    div {
        text "Some child"
    }
}
```

You may define dynamic attributes for any elements or instances in a component. For example:

```paperclip
public component Button {
    render button(class: class, onClick: onClick) {
        slot children
    }
}
```

Components support the concept of style variants. For example:

```paperclip
component Button {
    variant hover trigger {
        ":hover"
    }
    render button {
        style {
            background: black
        }
        style variant hover {
            background: #333
        }
        slot children
    }
}

Button {
    text "click me!"
}
```

Note that variant triggers may contain mulitple CSS selectors. For example:

```paperclip
component Button {
    variant hover trigger {
        ":hover"
        ".hover"
    }
    render button(class: class) {
        style {
            background: black
        }
        style variant hover {
            background: #333
        }
        slot children
    }
}

Button {
    text "click me!"
}
Button(class: "hover") {
    text "hover state!"
}
```

you may also define media queries within variant triggers. For example:

```paperclip
component Button {
    variant hover trigger {
        ":hover"
        ".hover"
    }
    variant mobile trigger {
        "@media screen and (max-width: 400px)"
    }
    render button(class: class) {
        style {
            background: black
        }
        style variant hover {
            background: #333
        }
        style variant mobile {
            font-size: 1.3em
        }
        slot children
    }
}
```

Paperclip supports variant combinations. For example:

```paperclip
component Button {
    variant hover trigger {
        ".hover"
    }
    variant mobile trigger {
        "@media screen and (max-width: 400px)"
    }
    variant supportsFlexbox trigger {
        "@supports(display: flex)"
    }
    render button(class: class) {
        style variant hover + mobile {
            color: orange
        }
        style variant hover + mobile + supportsFlexbox {
            display: flex
            font-size: 1.3em
            background: #333
        }
        slot children
    }
}
```

Triggers are also re-usable. For example:

```paperclip
public trigger mobileTrigger "@media screen and (max-width: 400px)"

public component Button {
    variant mobile trigger {
        mobileTrigger
    }
    render button {
        style variant mobile
        slot children
    }
}
```

re-usable triggers enables them to be re-used in multiple places. This is especially useful for things like media queries that may want to be re-used in multiple components.

Note that variant triggers apply to the render node. For example, here's a nested node that uses a variant trigger:

```paperclip
token space03 4px

public component Card {
    variant hover trigger {
        ":hover"
        ".hover"
    }

    render div root {
        style {
            display: flex
            gap: var(space03)
        }
        div title {
            style {
                font-size: 24px
                font-weight: 600px
            }
            style variant hover {
                color: red
            }
            slot title {
                text "some title"
            }
        }
        div {
            slot children {
                slot "some children"
            }
        }
    }
}
```

Paperclip supports conditional nodes. For example:

```paperclip
public component Card {
    render div {
        if showSomething {
            text "do that thing"
        }
    }
}
```

is compiled to the following React code:

```paperclip
export const Card = ({showSomething}) => {
    return <div>
        {showSomething ? "do that thing" : null}
    </div>
};
```

Note how IDs on nodes are compiled to code. For example:

```paperclip
component Button {
    render button root {
        slot children
    }
}
public component Card {
    render div root {
        Button titleButton {
            text "click clack!" {
                style {
                    color: red
                }
            }
        }
    }
}
```

Paperclip components may define scripts that provide these components with behavior. For example:

```paperclip
public component Button {
  script(src: "./controller.tsx", target: "react", name: "SomeButton")
  render button (onClick: onClick, class: className) {
    slot children
  }
}
```

When a script is provided, Paperclip will use that script IF the target compiler specified in the script is used. In this case, it's react, so the script is used. the `name` parameter of script is used to figure out what higher-order-component to use defined within the script `src`. In this case, it's `SomeButton`.

Components and nodes defined at the root document may be considered as frames, and these frames may contain metadata expressed as a comment. Here's what that looks like:

```paperclip
/**
 * @frame(x: -918, y: -272, width: 1024, height: 768, visible: true)
 */

button {
    text "hello"
}
```

This frame is used within the visual editor to render a frame of the nodes and components specified within Paperclip documents. Note that as of now, root nodes and components like this are the only things that support comments.
