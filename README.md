<p align="center">
  <img src="./assets/logo-outline-5.png" width="400px">
</p>

> Join the [Discord channel](https://discord.gg/H6wEVtd) for the latest updates!

```sh
yarn install paperclip && yarn paperclip designer
```

<img width="1840" alt="Screenshot 2023-09-02 at 6 54 04 PM" src="https://github.com/paperclip-ui/paperclip/assets/757408/4a46b041-636f-4960-a663-177a044432f9">

**Paperclip is a visual programming language that offers a hybrid approach for creating web apps.** It comes with a UI builder that you can use to visually create UIs, and a readable file format that you can easily edit by hand.

Paperclip aims to lower the barrier for building UIs and create an inviting user experience for everyone that wants to contribute to building web applications. It was initially designed for product teams in the hopes of bridging the gap between development teams and all other key stakeholders (designers, marketers, copywriters, PMs, etc.). With Paperclip, the hope is that other team members feel empowered to build UIs, prototype, make tweaks, giving engineers more freedom to focus on some of the harder and more mission critical parts of the application such as business logic.

**Paperclip is _not_ a replacement for hand-written code**. It's my belief that code is _not_ a problem, but incidental complexity around _tooling_ is. Paperclip is an attempt to reduce some of the incidental complexity, specifically around HTML and CSS development.

<!-- It's also my belief that code _is_ the correct medium for writing software - even for "no-code" apps - since code is yet another "user interface" for building applications, and  -->

### What makes Paperclip pretty neat? 🤩

Paperclip is a _bit_ different than other no-code platforms such as Webflow. Here are some bits that I think differentiate Paperclip from _almost_ everything else:

- Design files can be stored anywhere you want, including GIT
  - Everyone can work out of the same source of truth! And you'll probably want this since I'm assuming that you also have a whole QA process with this (which I'm assuming you'll want if _everyone_ can write code).
  - Meaning that you can also use GIT for versioning designs. Other design tools have their own way of doing this.
- Paperclip can be compiled to different frameworks and languages, and is designed to work with your existing codebase and libraries.
  - For example, you can use any CSS framework you want within the Paperclip designer such as Tailwind, Bootstrap, or jQuery if you really want. And even Mootools.
- **No dependencies!** Just download the `paperclip_cli` bin and start'er up. Batteries are all included.
  - A note: The NPM dependency is really just a thin wrapper around this
- **Sometimes it's just faster to write HTML and CSS by hand**. With Paperclip you can do that. Heck, you can even code _and_ design in side-by-side!
- Some people may also prefer _not_ to use a UI for building apps. Some people may want to use the editor, some people may want to write by hand. With Paperclip, you have that option.
- Easily migrate away from Paperclip if things don't work out 💔
  - Paperclip is mostly just HTML and CSS, so you can easily migrate over to something like styled components if you want to. In the future, there may be tooling to help with this.

### Use Paperclip in your existing app ♻️

Paperclip is complimentary to your existing codebase. Just use one of thebuilt-in compilers to convert `*.pc` files in your framework or language ofchoice, and import them like normal code. Here's an example:

```typescript
import { TodoItem } from "./todo-item.pc";

<TodoItem />

// show "done" variation
<TodoItem className="done" />
```

### How can I use Paperclip in my project? 🤔

Paperclip is meant for _styling_ and creating primitive components. **It's probably best thought of as a design system tool**, and replaces other tools like styled components, BEM (CSS pattern), CSS modules, etc.

Paperclip works well with CSS frameworks like Tailwind since you can load these CSS frameworks into the designer and use them when you're creating your UIs visually. ✨

### Not your typical HTML and CSS

Paperclip hopes to remove some of the gotchas around HTML and CSS (e.g: selectors, globals, style collisions) by introducing _different_ syntax for styling elements. The DSL is also a _reflection_ of an ideal user experience similar to Figma and other design tools, hoping to create an inviting experience for people who are mostly living in those spaces.

Here's an example of what a "design file" looks like:

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
s
    // You may attach variants to any element within
    // this component
    style variant dark {
      background: black
      color: white
    }
  }
}
```

You still have the same flexibility as CSS! Just in a different format.

<!-- TODO: read more here -->

### Why a DSL? Why not JSON?

The main point of having a DSL is to have a readable file format that can be hand-written when necessary. Some other points:

- Code reviewing is easier with a DSL
- quality assurance - easier to see how well a document is structured
  - You _want_ this since HTML and CSS has behavior around responsiveness and such. It's not like you can just look at a UI and QA it based on that - you need to inspect the document.
- Sometimes it's just faster to type out the UI by hand rather than feeling restricted by a visual editor. This was a big one for me.

An earlier version of Paperclip _did_ use JSON and it failed the practicality test _I think_. If you want to get a sense about how impractical JSON felt, take a look at this file: https://github.com/crcn/tandem-old/blob/10.0.0/packages/front-end/src/components/root/workspace/right-gutter/styles/pretty/panes/box-shadows.pc

### Should I use Paperclip right now?

Are you working on an experiment or side-project? Sure! Give it a whirl! I'd love to hear what you think. Though, I wouldn't recommend using Paperclip right now for mission critial pieces of software since it's still very alpha, and very buggy. This may change at a later point, _but_ I need to emphasize that this is a side project and a passion of mine, and so I only get to work on Paperclip when I can.

<!-- ### Just covers the UI

## Design and code in parallel!

Paperclip is just a replacement for HTML and CSS, and nothing more.  -->

<!-- ### Simplified and safe data model

HTML and CSS can feel complex and daunting to some people, and there are also many gotchas around web development that people. Paperclip -->

<!-- ### Can handle the most complex web apps

Paperclip is designed to take on any problem that you throw at it -->

<!-- ### Invite everyone on your team build UIs 👨🏻‍🎨

No more needing to ask developers to make HTML and CSS changes, Paperclip enables anyone to make changes themselves using the UI builder. Marketers, designers, copywriters, whoever. Invite everyone to build UIs, and ship things faster than ever!

- spot edit visual bugs

-->

## Roadmap

- More design tooling
  - canvas tooling
  - potentially custom components
  - bringing UX closer to Figma for a more inviting user experience
- Online designer
  - multi-player editing too!
- AI assistance
- Figma integration
  - ability to copy + paste designs to Paperclip
  - ability to keep designs in sync
