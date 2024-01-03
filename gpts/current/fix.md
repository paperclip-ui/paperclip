This is invalid syntax:

```
div {
    style {
        background-color: darkgray;
        padding: 20px;
        text-align: center;
    }
}
```

This is the correct syntax:

```
div {
    style {
        background-color: darkgray
        padding: 20px
        text-align: center
    }
}
```

This is invalid syntax:

```
component Footer {
    render div {
        text "Footer"
        style {
            background-color: darkgray
            padding: 20px
            text-align: center
            "@media screen and (max-width: 480px)" {
                font-size: 12px
            }
        }
    }
}
```

This is the correct syntax

```
component Footer {
    variant mobile trigger {
        "@media screen and (max-width: 480px)"
    }
    render div {
        text "Footer"
        style {
            background-color: darkgray
            padding: 20px
            text-align: center
        }
        style variant mobile {
            font-size: 12px
        }
    }
}
```

This is invalid syntax:

```
render div {
    text "This is a Card"
    style {
        background-color white
        border "1px solid black"
        padding 20px
        margin 10px
        box-shadow "0 4px 8px 0 rgba(0,0,0,0.2)"
        transition "0.3s"
    }
    style variant mobile {
        font-size 14px
        padding 10px
    }
}
```

- For style declarations, semi colons must exist between the key and value
- declaration values must not be wrapped around with quotes

Here's the fix:

```
render div {
    text "This is a Card"
    style {
        background-color: white
        border: 1px solid black
        padding: 20px
        margin: 10px
        box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2)
        transition: 0.3s
    }
    style variant mobile {
        font-size: 14px
        padding: 10px
    }
}
```

This is invalid syntax:

```
render div {
    text "This is a Responsive Card"
    style {
        background-color: white
        border: 1px solid black
        padding: 20px
        margin: 10px
        box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2)
        transition: 0.3s
        max-width: 300px
    }
    style variant mobile {
        font-size: 14px
        padding: 15px
        margin: 5px
        max-width: 100%
    }
}
```

- The mobile variant is undefined here. style variants
  can only be defined in components since variants can only be defined
  in components.
- the render keyword is reserved for components

Here's the fix:

```
component Card {
    variant mobile trigger {
        "@media screen and (max-width: 100px)"
    }
    render div {
        text "This is a Responsive Card"
        style {
            background-color: white
            border: 1px solid black
            padding: 20px
            margin: 10px
            box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2)
            transition: 0.3s
            max-width: 300px
        }
        style variant mobile {
            font-size: 14px
            padding: 15px
            margin: 5px
            max-width: 100%
        }
    }
}
```

This is invalid syntax:

````
variant mobile trigger {
    "@media screen and (max-width: 600px)"
}

component Card {
    use variant mobile
    render div {
        text "This is a Responsive Card"
        style {
            background-color: white
            border: 1px solid black
            padding: 20px
            margin: 10px
            box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2)
            transition: 0.3s
            max-width: 300px
        }
        style variant mobile {
            font-size: 14px
            padding: 15px
            margin: 5px
            max-width: 100%
        }
    }
}
```

If you want to re-use a trigger, he's how you do that:

````

trigger mobileTrigger {
"@media screen and (max-width: 600px)"
}

component Card {
variant mobile trigger {
mobileTrigger
}
render div {
text "This is a Responsive Card"
style {
background-color: white
border: 1px solid black
padding: 20px
margin: 10px
box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2)
transition: 0.3s
max-width: 300px
}
style variant mobile {
font-size: 14px
padding: 15px
margin: 5px
max-width: 100%
}
}
}

```

When I say "create a card component", or any instruction for producing code, I
want you to produce Paperclip code, and only paperclip code.
```
