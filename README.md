<p align="center">
  <img src="./assets/logo-outline-5.png" width="400px">
</p>

> Join the [Discord channel](https://discord.gg/H6wEVtd) for the latest updates!


Paperclip is a tiny visual programming language that offers a hybrid approach for creating design systems and presentational components. You have the option to use the UI builder:

<img width="1840" alt="Screenshot 2023-09-02 at 6 54 04 PM" src="https://github.com/paperclip-ui/paperclip/assets/757408/4a46b041-636f-4960-a663-177a044432f9">

The UI builder writes Paperclip code which you may also write by hand. Here's what the code might look like:

```javascript

/* This is a design system token */
token defaultFontFamily "Inter"

/* This is a re-usable style */
style typography {
  font-family: var(defaultFontFamily)
}

/* A re-usable component that you can import directly into code */
public component TodoItem {

  /* variant styles of the component that can be triggered by
  CSS selectors */
  variant done trigger {
    ".done"
  }

  render li(class: className) {
    style extends typography
    style variant done {
      text-decoration: strike-through;
    }

    /* slots are areas where you can insert children into */
    slot children {

      /* This will be displayed if no slot is defined */
      text "Todo Item"
    }
  }
}
```

This can be compiled and imported directly into code like so:

```typescript
import { TodoItem } from "./todo-item.pc";

<TodoItem />

// show "done" variation
<TodoItem className="done" />
```

Right now Paperclip supports **React**. Other compiler targets in the future may be supported such Svelte, Vue, Rust, PHP, Ruby, etc.

<!--

## Why the hybrid approach?
## Why use Paperclip?

Paperclip is intended to make it easier and faster for anyone to contribute to UI development, and in the same codebase. Why is this special?

- Everything is saved in GIT
- UI changes go through the same CI / CD pipeline
- UI changes are easy to code review -->

## Installation

To get started with the designer, just create a new codespace and install the Paperclip extension. After that, you'll see a new toolbar icon that you can click in order to open the designer whenever you want.

After the designer is open, you're free to edit any Paperclip file (`*.pc`) and save directly to the codebase (probably through a pull-request).

## Development setup

The develeopment tooling enables you to compile design files into application code (currently supporting vanilla React, HTML, and vanilla CSS). To get started, run the following command:

```sh
# TODO SH installation command
npx @paperclip-ui/cli init
```

This will run through the installation process for your project. After that, you can start using Paperclip locally with your existing codebase.

## CLI Usage

You can use the CLI tool to compile and edit design files locally. Here are some example commands:

```sh
# Build all paperclip files
paperclip build

# Open the paperclip designer in a browser for visual development
paperclip designer
```

## Contributing

Right now, the _main_ focus for the app is around the designer UI and UX. If you're a designer and would like to help out with that, awesome! The main thing that would be super helpful is to come up with suggestions and / or design around how to improve the designer to better suite your workflow.

You're welcome to use the designer, Figma, or any tool to submit suggestions. If they're accepted, we'll wire up your designs and include the new functionality in the designer.

## Roadmap

There are a number of things on the horizon for Paperclip, not in order:

- Visual regression coverage of all UI
- Import directly from Figma
- More compiler targets
  - Various frameworks: Svelte, Vue
  - Various design systems: MaterialUI, Radix, Chakra, etc.
  - More language: PHP, Java, Ruby, etc.
- Ability to build and deploy apps built in Paperclip
- More platform targets like iOS, Android (this is a big maybe)
