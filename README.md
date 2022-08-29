<p align="center">
  <img src="assets/logo.svg" width="170px">
  <h1 align="center">Tandem (Preview)</h1>
</p>

> Tandem is still new, so expect bugs. If you'd like to contribute, feel free to reach out!

<!-- [![Backers on Open Collective](https://opencollective.com/tandem/backers/badge.svg)](#backers)
[![Sponsors on Open Collective](https://opencollective.com/tandem/sponsors/badge.svg)](#sponsors) -->

Tandem is an **experimental** UI builder that aims to provide a universal way of visually creating web applications across just about any language or framework. 

![Split view](./assets/screenshots/v10.1.7.png)

### Why?

Translating designs to code is one of the more tedious processes around product development, and it isn't perfect. In my experience, there's typically a discrepancy the design, and what's available or capable in code (e.g: colors and spacing that aren't part of the design system). As a result, I've found that there's typically a lot of back-and-forth between 

### One source of truth for design systems

Tandem aims to have a similar user experience as Figma, 

### Why not just use an existing design system like MUI?



### A common language for designers and developers

TODO: paperclip



### Installation

Tandem works in Windows & MacOS. There are a few ways you can install it:

b. Install the command line tools:

```bash
npm install tandem-cli --save-dev
cd path/to/app

# Create a new project
./node_modules/.bin/tandem init

# Open project
./node_modules/.bin/tandem open
```

The command line tools can manage multiple versions of Tandem, which is helpful for multiple projects that use different UI file (`*pc`) versions.

More info can be found in the [installation docs](./docs/installation.md)

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
