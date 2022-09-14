```html
<div export component as="Test">
  <Child>
    <style>
      @variant mobile {
        @toggle mobile on;
      }
    </style>
  </Child>
</div>

<div export component as="Child">
  <style>
    // start with the name
    @variant mobile {
    }
  </style>
</div>
```

```javascript
component Test {
  render Child {
    style {
      if self.mobile {
        curr.mobile = true;
        if curr.mobile {

        }
      }
      target
    }
  }
}

trigger desktop [media screen and (max-width: 100px), selector(":nth-child(2n)")];

component Child {
  variant mobile (trigger: desktop);

  @label "Header"
  render div {
    style {
      if mobile {

      }
    }
  }
}
```
