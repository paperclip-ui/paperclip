Compiles Paperclip files down to vanilla HTML & CSS

TODO:

- [ ] ability to define pages via config
- [ ] Possibly connect to "build" button in UI
- [ ] variable triggers for setting state
- [ ] controller code
- [ ] move file assets toassets directory

Config example:

```javascript
module.exports = {
  // for all pages
  cssFileName: "index.css",
  pages: [
    {
      fileName: "index.html",
      component: {
        name: "Main",
      },
      variables: {
        "/": "home",
      },
    },
    {
      fileName: "contact.html",
      component: {
        name: "Main",
      },
      variables: {
        "/": "contact",
      },
    },
    {
      fileName: "people.html",
      data: {
        people: [],
      },
      variables: {
        "/": "people",
      },
    },
  ],
};
```
