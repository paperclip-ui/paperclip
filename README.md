<p align="center">
  <img src="./assets/logo-outline-5.png" width="400px">
</p>

> Join the [Discord channel](https://discord.gg/H6wEVtd) for the latest updates!

```sh
yarn install paperclip && yarn paperclip designer
```

<img width="1840" alt="Screenshot 2023-09-02 at 6 54 04 PM" src="https://github.com/paperclip-ui/paperclip/assets/757408/4a46b041-636f-4960-a663-177a044432f9">

**Paperclip is a visual programming language that offers a hybrid approach for creating web apps.** It comes with a UI builder that you can use to visually create UIs, and a readable file format that you can easily edit by hand.

Paperclip aims to lower the barrier for building UIs and create an inviting user experience for everyone that wants to contribute to building web applications. It was initially designed for product teams in the hopes of bridging the gap between development teams and all other key stakeholders (designers, marketers, copywriters). With Paperclip, the hope is that other team members feel empowered to build UIs, giving engineers more freedom to focus on some of the harder parts of the application such as business logic.

**Paperclip is _not_ a replacement for hand-written code**. It's my belief that code is _not_ a problem, but incidental complexity around _tooling_ is. Paperclip is an attempt to reduce some of the incidental complexity, specifically around visual development (basically just HTML and CSS).

### What makes Paperclip pretty neat? 🤩

Paperclip is a _bit_ different than other no-code platforms such as Webflow. Here are some bits that I thinks stand out:

- Design files can be stored anywhere you want, including GIT
  - Everyone can work out of the same source of truth! And you'll probably want this since I'm assuming that you also have a whole CI / CD process with this.
  - Meaning that you can also use GIT for versioning designs. Other design tools have their own way of doing this.
- Paperclip can be compiled to different frameworks and languages, and is designed to work with your existing codebase and libraries.
  - For example, you can use any CSS framework you want within the Paperclip designer such as Tailwind, Bootstrap, or jQuery if you really want. And even Mootools.
- **No dependencies!** Just download the `paperclip_cli` bin and start'er up. Batteries are all included.
  - A note: The NPM dependency is really just a thin wrapper around this

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

### Not your typical HTML and CSS

Paperclip hopes to remove some of the gotchas around HTML and CSS (e.g: selectors) by introducing _different_ syntax for styling elements, and reflects an ideal designer experience.

Here's an example of what "design file" looks like:

```javascript
public component Card {

  // Variant fo the component that can be _triggered_
  // by a CSS selector or media query
  variant dark trigger {
    ".dark"
  }
  render div (class: class) {

    // styles are added directly on the element being styled
    style {
      font-family: sans-serif
      color: black
    }

    // You may attach variants to any element within
    // this component
    style variant dark {
      background: black
      color: white
    }
  }
}
```

This is reflected in the design tooling which has a similar feel to Figma.

## Roadmap

- More design tooling
  - canvas tooling
  - potentially custom components
- Codespaces integration
- Online designer
- AI assistance
- Figma integration
  - ability to copy + paste designs to Paperclip
  - ability to keep designs in sync
