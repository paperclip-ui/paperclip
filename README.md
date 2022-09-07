<p align="center">
  <img src="assets/logo.svg" width="170px">
  <h1 align="center">Tandem (Preview)</h1>
</p>


Tandem is an **experimental** UI builder for that aims to make it easier for anyone to build web applications. It compiles down to plain code, and works with existing codebases. Here's what it looks like:

![Split view](./assets/screenshots/v10.1.7.png)

### Why?

Current "no-code" solutions are hard to scale as projects and teams get larger. Tandem aimed to solve this by providing additional features to help make it to be a viable replacement for hand-written HTML and CSS. Here's how:

- Tandem doesn't aim to replace handwritten code, but compliment it. 
- Tandem uses [code](#file-format) as a data format.
- Tandem is designed to work well with your existing development process (works with GIT, CI-CD, code review).
- Tandem files are compiled down to strongly typed code.
- Tandem gives you control over how much complexity to give to your team. E.g: you can give your team just building blocks to work with, or give your team fine-grained control and allow them to write HTML and CSS.
- CSS in Tandem is locally scoped, meaning that you don't really need to worry about them leaking into other parts of your app.

### State of development

Tandem's on the backburner right now so that I can focus on other endeavors. If you're interested in the project though, feel free to reach out! I'm always interested in jamming on this space.

### History

The current state of Tandem is the result of some years in the no-code space, including some learnings working at [Webflow](https://webflow.com/). There have been prior iterations of this version which include:

- [v1](https://github.com/crcn/tandem-old/tree/old)
- [v2](https://github.com/crcn/tandem-old/tree/0.1.1) which aimed to allow for _any_ web application to be editable
- [v3](https://github.com/crcn/tandem-old/tree/10.0.0) which primarily focused on the presentational layer
- [Paperclip v1](https://github.com/paperclip-ui/paperclip) which focused on the data model
- v4 - this version which combines v3 and Paperclip v1


### File format

Tandem saves to a superset of HTML and CSS called Paperclip. Here's what that looks like:

```jsx
import "../components/atoms/view.pc" as imp0
import "./react/form.pc" as imp1
import "../components/inputs/molecules.pc" as imp2
import "../components/inputs/text/view.pc" as imp3
import "../components/inputs/button/view.pc" as imp4

/**
 * @bounds(left: 0, right: 600, top: 0, bottom: 400)
 */
public component StarterKitFormOptions {
  script (src: "./form-controller.tsx")
  variant react (enabled: [])
  render div {
    style {
      padding-left: 12px
      padding-top: 12px
      padding-right: 12px
      padding-bottom: 12px
      max-width: 300px
      margin-right: auto
      margin-left: auto
      position: relative
      top: 20%
    }
    div element1 {
      style {
        box-sizing: border-box
        display: block
      }
      text title "New TYPE Project" {
        style {
          include imp0.baseFont
          padding-bottom: 12px
          display: inline-block
          font-size: 18px
          font-weight: 600
        }
      }
    }
    imp1.ReactStartKitOptionsForm reactStartKitOptionsForm {
      style {
        display: none
      }
    }
    imp2.LabeledInput labeledInput {
      override text1 "Project Directory"

      insert input {
        div element2 {
          style {
            box-sizing: border-box
            display: flex
          }
          imp3.TextInput directoryInput (placeholder: "path/to/directory") {
            style {
              margin-right: 12px
            }
          }
          imp4.Button browseButton {
            override text1 "browse"

          }
        }
      }
    }
    div element3 {
      style {
        box-sizing: border-box
        display: flex
        justify-content: flex-end
        padding-top: 6px
      }
      imp4.Button createProjectButton {
        override {
          variant disabled (enabled: false)
        }
        override text1 "Create Project"

      }
    }
  }
}
```

### Resources

- [Installation](./docs/installation.md)
- [Releases](https://github.com/tandemcode/tandem/releases)
- [Tutorial videos](https://www.youtube.com/playlist?list=PLCNS_PVbhoSXOrjiJQP7ZjZJ4YHULnB2y)
- [Terminology & Concepts](./docs/concepts.md)
- [Goals & Non-goals](./docs/goals.md)
- [Examples](./examples)
- [Development](./docs/contributing/development.md)
- Language integrations
  - [React](./packages/paperclip-react-loader)

<!--
## Contributors

This project exists thanks to all the people who contribute.
<a href="https://github.com/tandemcode/tandem/graphs/contributors"><img src="https://opencollective.com/tandem/contributors.svg?width=890&button=false" /></a>

## Backers

Thank you to all our backers! 🙏 [[Become a backer](https://opencollective.com/tandem#backer)]

<a href="https://opencollective.com/tandem#backers" target="_blank"><img src="https://opencollective.com/tandem/backers.svg?width=890"></a>

## Sponsors

Support this project by becoming a sponsor. Your logo will show up here with a link to your website. [[Become a sponsor](https://opencollective.com/tandem#sponsor)]

<a href="https://opencollective.com/tandem/sponsor/0/website" target="_blank"><img src="https://opencollective.com/tandem/sponsor/0/avatar.svg"></a>
<a href="https://opencollective.com/tandem/sponsor/1/website" target="_blank"><img src="https://opencollective.com/tandem/sponsor/1/avatar.svg"></a>
<a href="https://opencollective.com/tandem/sponsor/2/website" target="_blank"><img src="https://opencollective.com/tandem/sponsor/2/avatar.svg"></a>
<a href="https://opencollective.com/tandem/sponsor/3/website" target="_blank"><img src="https://opencollective.com/tandem/sponsor/3/avatar.svg"></a>
<a href="https://opencollective.com/tandem/sponsor/4/website" target="_blank"><img src="https://opencollective.com/tandem/sponsor/4/avatar.svg"></a>
<a href="https://opencollective.com/tandem/sponsor/5/website" target="_blank"><img src="https://opencollective.com/tandem/sponsor/5/avatar.svg"></a>
<a href="https://opencollective.com/tandem/sponsor/6/website" target="_blank"><img src="https://opencollective.com/tandem/sponsor/6/avatar.svg"></a>
<a href="https://opencollective.com/tandem/sponsor/7/website" target="_blank"><img src="https://opencollective.com/tandem/sponsor/7/avatar.svg"></a>
<a href="https://opencollective.com/tandem/sponsor/8/website" target="_blank"><img src="https://opencollective.com/tandem/sponsor/8/avatar.svg"></a>
<a href="https://opencollective.com/tandem/sponsor/9/website" target="_blank"><img src="https://opencollective.com/tandem/sponsor/9/avatar.svg"></a>

-->
