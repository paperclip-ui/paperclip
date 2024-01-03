<p align="center">
  <img src="./assets/logo-outline-5.png" width="400px">
</p>

> Join the [Discord channel](https://discord.gg/H6wEVtd) for the latest updates!

### Paperclip is a UI builder for creating **styled components** visually.

https://github.com/paperclip-ui/paperclip/assets/757408/429b22e0-41d6-4621-8b6e-613c1686cdda

Paperclip emits primitive components that you can use in your existing codebase. For example:

```
import React from "react";
import * as styles from "./button.pc";
export const Button = ({children, onClick}) => {
  return <styles.Button onClick={onClick}>
    {children}
  </styles.Button>
};
```

Paperclip _only_ covers styles and primitive components, and is not a replacement to code. You can think of it like a design system creator.

### Project goals + highlights

- Languange + framework agnostic
- Provide a scalable way of styling with CSS without the cascading part
- No runtime. PC files are compiled to static HTML and CSS.
- Lower the barrier to UI development to so that designers and other teammembers can edit UIs

### File format

Paperclip emits plain-text design files. Here's an example of of one:

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

This can compile to vanilla HTML and CSS, as well any supported target framework or language of your choosing. Here's an example of how
the example above might be compiled to CSS:

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

And here's how the file might be compiled to React code:

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
