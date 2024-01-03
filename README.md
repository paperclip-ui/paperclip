<p align="center">
  <img src="./assets/logo-outline-5.png" width="400px">
</p>

> Join the [Discord channel](https://discord.gg/H6wEVtd) for the latest updates!

```sh
npx paperclip designer --open
```

Or download one of the standalone binaries here: https://github.com/paperclip-ui/paperclip/releases

---

- Documentation
  - [Syntax](./docs/syntax.md) - Info about the DSL
  - [Getting Started](#getting-started)
  - [CLI Usage](#cli)

---

Paperclip is a UI builder for creating **styled components** visually.

https://github.com/paperclip-ui/paperclip/assets/757408/429b22e0-41d6-4621-8b6e-613c1686cdda

Paperclip files are designed to compile to any target language or framework you want (currently supporting React), and can even be compiled down to vanilla HTML and CSS. No runtime.

Here's an example of Paperclip's file format:

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

// re-usable chunk of HTML and CSS
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

Here's what the compile CSS looks like:

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

And here's what a styled component looks like:

```tsx
export const Button = ({ children }) => (
  <button className="Button">{children}</button>
);
```

### Getting Started

1. **[download one of the releases](https://github.com/paperclip-ui/paperclip/releases), or run `yarn install paperclip -D`**

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
