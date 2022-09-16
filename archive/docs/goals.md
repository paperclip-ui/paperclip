The ideas behind Tandem are continuing to evolve based on real-world usage, so the guiding principles in this doc _may_ change in the future. For now, the ideas here guide feature development.

#### Goals

- To be interoperable with _most_ web-based languages.
- To be interoperable with existing code.
- To be a _safer_ alternative to writing code by hand, and to integrate with existing safety measures in the codebase (integrating with typed systems, automated testing, localized styles).
- Provide _better_ tooling for authoring HTML, CSS, and other visual behavior _where it makes sense_.
- To be interoperable with existing tools like Sketch, After Effects, and Figma.
- Flexibility around how code is written around Tandem UIs.
- Escape hatches to help people migrate away from Tandem if they wany to.
- Provide tooling that can easily be used in teams.
- Develop features with scalability & maintainability in mind.
- Use existing knowledge & practices around building HTML & CSS.

#### Non-goals

- Turing completeness. Tandem's functionality will be limited to tooling where it makes sense: basic HTML, CSS, and _simple_ behavior (slots & components). All other functionality will have to be hand coded.
- Sketch-like user experience. Tandem will only provide functionality & tooling that is compatible with how the web works.
- Runtimes or any other non-native functionality. Tandem files will always be compilable down to static HTML & CSS.
- Cover _all_ front-end user interface development cases. Tandem will target _simple_ use cases. Complex use cases will be deferred to other software and hand written code where it makes sense.
- To cover the entire development process between `mock-up -> design -> prototype -> development -> deploy`. Tandem may provide tooling to make each step more efficient, but will always focus on the `development` process.
- Abstractions around HTML & CSS. Tandem will always try to aim to provide transparent tooling that _augment_ HTML & CSS creation.
