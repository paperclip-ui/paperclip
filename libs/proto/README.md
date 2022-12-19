Contains all of the models that need to be shared between different systems, including the JavaScript-based designer. Ideally
this module whould be split, but protobufs + tooling around it lack modularity, so we're forced to do this unfortunately unless:

1. A new version comes out that supports modularity
2. We bend the libraries to our will

#2 seems more likely, but out of scope for the initial phases of Paperclip. When things stabilize, this module should be revisted.
