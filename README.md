<p align="center">
  <img src="./assets/logo-outline-5.png" width="400px">
</p>

> Join the [Discord channel](https://discord.gg/H6wEVtd) for the latest updates!

```sh
yarn add @paperclip-ui/cli -D && yarn paperclip designer --open
```

Or download one of the standalone binaries here: https://github.com/paperclip-ui/paperclip/releases

---

- Documentation
  - [Syntax](./docs/syntax.md) - Info about the DSL
  - [Getting Started](#getting-started)
  - [CLI Usage](#cli)

---

**Paperclip is a tiny styling language for ambitions web applitions**. Here's an example of what it looks like:

```javascript

// You may define individual tokens to be re-used
public token fontFamily Inter

public token background01 #333
public token background02 #555
public token fontColor #333

// You may also define groups of styles
public style defaultFont {
  font-family: var(fontFamily)
  color: var(fontColor)
}

// This is a styled component that you can use in your app
public component Button {
  variant hover trigger {
    ":hover"
  }

  render button {
    style extends defaultFont {
      background: var(background01)
    }
    style variant hover {
      background: var(background02)
    }
    slot children
  }
}
```

Here's what the compiled CSS looks like:

```css
:root {
    --fontFamily: Inter
    --background01: #333
    --background02: #333
    --fontColor: #333
}

.Button {
    font-family: var(--fontFamily)
    color: var(--fontColor)
    background: var(--background01)
}

.Button:hover {
    background: var(--background02)
}
```

The styled components defined in Paperclip can be compiled to different libraries and frameworks. For example, here's what the emitted React code looks like:

```tsx
export const Button = ({ children }) => (
  <button className="Button">{children}</button>
);
```

Here's how you import Paperclip into your app:

```tsx
import { Button } from "./button.pc.js";

<Button>Click me!</Button>;
```

### Why Paperclip?

- Provides a scalable approach to styling web apps.
  - Paperclip is strongly typed, and generates strongly typed code.
  - There's no cascading styles in Paperclip. Instead, Paperclip uses component variants.
- No runtime. Paperclip is compiled to static HTML and CSS.
- Comes with a designer that allows you to visually edit Paperclip files.
- No dependencies! Just [download one of the standalone binaries](https://github.com/paperclip-ui/paperclip/releases).
- Framework / language agnostic, meaning that you can re-use your `*.pc` files anywhere you want. 

#### Comparing CSS-in-JS

Paperclip supports styled components. For example:

```javascript
public component Card {
  render div {
    style {
      padding: 14px
      font-size: 16px
      font-family: sans-serif
    }
    slot children
  }
}
```

Here's the equivalent code using `styled-components`:

```typescript
import styled from "styled-components";

export const Card = styled.div`
  padding: 14px;
  font-size: 16px;
  font-family: sans-serif;
`;
```

Paperclip compiles to static HTML and CSS, meaning that there's no runtime, which is comparable to CSS-in-JS options that use Babel transforms.

#### Comparing with CSS

Paperclip is different than CSS in that Paperclip doesn't support the cascading part (which means that you don't risk style collisions). Instead, you have variants. For example, in CSS you might write:

```css
.Page {
  font-size: 14px;
}
@media screen and (max-width: 700px) {
  .Page {
    font-size: 21px;
  }
}
```

In Paperclip, the equivalent would be:

```typescript
trigger mobileTrigger "@media screen and (max-width: 700px)"

public component Page {
  variant mobile trigger {
    mobileTrigger
  }
  render div {
    style {
      font-size: 14px
    }
    style variant mobile {
      font-size: 21px
    }
    slot children
  }
}
```

Paperclip is also strongly typed. For example:

```typescript
style defaultFont {

  // Error!
  font-family: var(fontFamily)
}
```

Would emit an error since `fontFamily` doesn't exist.

Lastly, Paperclip files aren't limited to CSS, and are designed to compile to different targets (more of this in the future).

### Getting Started

1. **[download one of the releases](https://github.com/paperclip-ui/paperclip/releases), or run `yarn install @paperclip-ui/cli -D`**

2. **run this command in your project directory:**

```
paperclip init
```

This will create a `paperclip.config.json` file for you.

3. **Copy the following contents to `src/hello.pc`**

```typescript
public component Hello {
  render div {
    style {
      color: red
    }
    slot children
  }
}
```

4. **Run `paperclip build`**

This will compile your `*.pc` files into code that you can import
directly into your app.

And that's it! 🎉

<!--## Designer

https://github.com/paperclip-ui/paperclip/assets/757408/429b22e0-41d6-4621-8b6e-613c1686cdda-->
