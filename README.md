<p align="center">
  <img src="./assets/logo-outline-5.png" width="400px">
</p>

> Join the [Discord channel](https://discord.gg/H6wEVtd) for the latest updates!

```sh
yarn install paperclip && yarn paperclip designer
```

<img width="1840" alt="Screenshot 2023-09-02 at 6 54 04 PM" src="https://github.com/paperclip-ui/paperclip/assets/757408/4a46b041-636f-4960-a663-177a044432f9">

**Paperclip is a visual programming language that offers a hybrid approach for creating web apps.** It comes with a UI builder that you can use to visually create UIs, and a readable file format that you can easily edit by hand.

Paperclip aims to lower the barrier for building UIs and create an inviting user experience for everyone that wants to contribute to building web applications.

<!-- ### Just covers the UI

Paperclip is just a replacement for HTML and CSS, and nothing more.  -->

<!-- ### Simplified and safe data model

HTML and CSS can feel complex and daunting to some people, and there are also many gotchas around web development that people. Paperclip -->

<!-- ### Can handle the most complex web apps

Paperclip is designed to take on any problem that you throw at it -->

<!-- ### Invite everyone on your team build UIs 👨🏻‍🎨

No more needing to ask developers to make HTML and CSS changes, Paperclip enables anyone to make changes themselves using the UI builder. Marketers, designers, copywriters, whoever. Invite everyone to build UIs, and ship things faster than ever!

- spot edit visual bugs

-->

### Use Paperclip in your existing app

Paperclip is complimentary to your existing codebase. Just use one of the built-in compilers to convert `*.pc` files in your framework or language of choice, and import them like normal code. Here's an example:

```typescript
import { TodoItem } from "./todo-item.pc";

<TodoItem />

// show "done" variation
<TodoItem className="done" />
```

### Simple file format ✨

Paperclip is a very simple language that only covers basic functionality for primitive or "dumb" components. Here's an example of what a Paperclip file looks like:

```javascript

// Re-usable design tokens that you can use throughout the app
public token fontSize01 14px
public token fontColor #333

// Re-usable composite tokens or "mixins" that you can re-use
public style defaultFont {
  font-family: sans-serif
  font-size: var(fontSize01)
  color: var(fontColor)
}

public component TodoItem {

  // Variations of the component that can triggered
  // by CSS selectors and media queries
  variant checked trigger {
    ".checked"
  }

  render li(class: className, onClick: onClick, checked: checked) {

    // Styles are declared directly on the element that's being styled
    style extends defaultFont {
      display: flex
      align-items: center
    }

    style variant checked {
      text-decoration: linethrough
    }

    // You can define callbacks
    input(type: "checkbox", checked: checked)

    span label {

      // Areas of the component that
      slot label {

        // Default child for preview purposes
        text "Buy groceries"
      }
    }
  }
}
```

<!--

### Copy and paste directly from Figma
### AI assistant
### Import your existing codebase

-->

<!--Here's what the language looks like:

This can be imported directly into code like so:


```typescript
import { TodoItem } from "./todo-item.pc";

<TodoItem />

// show "done" variation
<TodoItem className="done" />
```-->

## Roadmap

- Codespaces integration
- Online designer
- AI assistance
