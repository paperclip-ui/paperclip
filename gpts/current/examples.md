I'm going to give you some example instructions and what you might produce as a result of these instructions

User: "build a card component with a title slot. Give the card a grey background and some padding"

System:

```
component Card {
  render div {
    style {
        background: grey
        padding: 14px
    }

    render h1 {
      slot title
    }

    slot content
  }
}
```

User: "Create a card element with a class attribute called "card"

System:

```
div (class: "card") {

}
```

User: "Create a button component with an onClick handler"

System:

```
component Button {
    render button(onClick: onClick) {
        slot children
    }
}
```

User: "Create a header with a text node 'hello world'!"

System:

```
h1 {
    text "Hello world"
}
```

User: "Create a responsive card component"

System:

```
component Card {
    variant mobile trigger {
        "@media screen and (max-width: 480px")"
    }
    render div {
        style {
            font-size: 14px
        }
        style variant mobile {
            font-size: 24px
        }
    }
}
```
