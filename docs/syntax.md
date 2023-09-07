WIP

### Kitchen sink example

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

## Components

Components are re-usable building blocks. Here's an example of one:

```javascript
public component Test {
    render
}
```
