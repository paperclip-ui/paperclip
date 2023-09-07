<p align="center">
  <img src="./assets/logo-outline-5.png" width="400px">
</p>

> Join the [Discord channel](https://discord.gg/H6wEVtd) for the latest updates!

```sh
yarn add @paperclip-ui/cli && yarn paperclip designer --open
```

<img width="1840" alt="Screenshot 2023-09-02 at 6 54 04 PM" src="https://github.com/paperclip-ui/paperclip/assets/757408/4a46b041-636f-4960-a663-177a044432f9">

---

- [Documentation](./docs)
  <!-- - [Designer](./docs/designer.md) - Using the designer -->
  <!-- - [Syntax](./docs/syntax.md) - Info about the DSL and how write it by hand -->
  - [Integration](./docs/integration.md) - Integrating Paperclip into your app
  <!-- - [Configuration](./docs/config.md) - Configuring your project -->

---

**Paperclip is a visual programming language that offers a hybrid approach for creating web apps.** It comes with a UI builder that you can use to visually create UIs, and a readable file format that you can easily edit by hand.

Paperclip aims to lower the barrier for building UIs and create an inviting user experience for everyone that wants to contribute to building web applications. It was initially designed for product teams in the hopes of bridging the gap between development teams and all other key stakeholders (designers, marketers, copywriters, PMs, etc.). With Paperclip, the hope is that other team members feel empowered to build UIs, prototype, make tweaks, giving engineers more freedom to focus on some of the harder and more mission critical parts of the application such as business logic.

**Paperclip is _not_ a replacement for hand-written code**. It's my belief that code is _not_ a problem, but incidental complexity around _tooling_ is. I.e: it's a design problem. Paperclip is an attempt to reduce some of the incidental complexity, specifically around HTML and CSS development. So, **think of Paperclip as a designer for primitive components, and a replacement for libraries like Emotion or Styled Components.**

<!-- It's also my belief that code _is_ the correct medium for writing software - even for "no-code" apps - since code is yet another "user interface" for building applications, and  -->

<!-- ### What makes Paperclip different?

Most other tools like Webflow are great for building websites and prototypes, and empowering everyone on your team to build in those space. Paperclip is tool to help empower everyone on your team to build the actual product.-->

<!-- Here's how:

- Design files are readable, and can be stored anywhere you want, including GIT.
  - Everyone can work out of the same source of truth! And you'll probably want this since I'm assuming that you also have a whole quality assurance process with this (which I'm assuming you'll want if _everyone_ is touching mission critical software).
  - Meaning that you can also use GIT for versioning designs and keep everything in sync (especially nice for feature development).
- Some people may also prefer _not_ to use a UI for building apps. Some people may want to use the editor, some people may want to write by hand. With Paperclip, teammates can pick medium they want for creating HTML and CSS.
- Paperclip works with you existing codebase and libraries, and can be compiled to different frameworks and languages.
-->

<!--Many no-code tools are also a great _starting_ point for companies, but don't do so well as they grow bigger (hard to maintain, hard to collaborate), and you may be forced to migrate away from them as they become more complex. **Paperclip's goal is to be a solution for any size codebase, any degree of complexity, and any size team, while also catering to specific needs and preferences of everyone that may need to interact with the tool.**-->

<!--### Technical features

- Store design files anywhere you want, including GIT
  - Everyone can work out of the same source of truth. And you'll probably want this since I'm assuming that you also have a whole quality assurance process for your dev stack (which I'm assuming you'll want if _everyone_ is touching mission critical software).
  - Unlike other visual editors that use JSON as a file format, Paperclip files can easily be code reviewed.
- **No dependencies!** Just download the `paperclip_cli` bin from [releases](https://github.com/paperclip-ui/paperclip/releases) and start'er up. Batteries are all included.
- Paperclip works with you existing codebase and libraries, and can be compiled to different frameworks and languages.
- PC fies are compiled to strongly typed code.
- Use PC files between different platforms! E.g: use the same PC files between your Python / Rust / TypeScript apps.-->

<!--- You can use any CSS framework you want within the Paperclip designer such as Tailwind, Bootstrap, or jQuery if you really want. And even Mootools. -->

### Import Paperclip files like any other module

Paperclip is complimentary to your existing codebase. Just use one of the built-in compilers to convert `*.pc` files in your framework or language of choice, and import them like normal code. Here's an example:

```typescript
import { TodoItem } from "./todo-item.pc";
<TodoItem />;
```

`*.pc` are even strongly typed too in case you're working with something like TypeScript, or another strongly typed language.

### How can I use Paperclip in my project? 🤔

Paperclip is meant for styling and creating simple components. **It's probably best thought of as a design system tool**, and replaces other tools like styled components, BEM (CSS pattern), CSS modules, etc.

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

<!-- ### Why a DSL? Why not JSON?

The main point of having a DSL is to have a readable file format that can be hand-written when necessary. Some other points:

- Code reviewing is easier with a DSL
- quality assurance - easier to see how well a document is structured
  - You _want_ this since HTML and CSS has behavior around responsiveness and such. It's not like you can just look at a UI and QA it based on that - you need to inspect the document.
- Sometimes it's just faster to type out the UI by hand rather than feeling restricted by a visual editor. This was a big one for me.

An earlier version of Paperclip _did_ use JSON and it failed the practicality test _I think_. If you want to get a sense about how impractical JSON felt, take a look at this file: https://github.com/crcn/tandem-old/blob/10.0.0/packages/front-end/src/components/root/workspace/right-gutter/styles/pretty/panes/box-shadows.pc-->

<!-- ### History 📚

This version of Paperclip is the result of many years of work and experimentation in the no-code space and working at Webflow. Here are some prior versions of Paperclip -->

### Should I use Paperclip right now?

Are you working on an experiment or side-project? Sure! Give it a whirl! I'd love to hear what you think. All feedback is welcome! Though, I _wouldn't_ recommend using Paperclip right now for mission critial pieces of software since it's still very alpha, and very buggy.

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
