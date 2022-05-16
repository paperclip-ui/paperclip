Paperclip DOM scraper allows you to record existing web apps and import them into Tandem projects.

![inter-trigger2](https://user-images.githubusercontent.com/757408/46576970-9e246080-c99e-11e8-84db-dc549ca0531f.gif)

#### How to use

1. [Copy the contents of the recorder script](https://raw.githubusercontent.com/tandemcode/tandem/master/packages/paperclip-dom-recorder/dist/paperclip-dom-recorder.js)
2. Paste the recorder script in in the _console_ of the app or website you'd like to record.
3. At this point, a snapshot of your app should be copied to your clipboard. Paste the contents to a `*.pc` file that's part of a Tandem project.
4. Open the Tandem project.

## Commands

There are a number of commands you can all _after_ you've pasted the recorder script in your website's console

##### paperclipDOMRecorder.takeSnapshot()

Takes a snapshot of the current DOM.

##### paperclipDOMRecorder.print()

Prints the current Paperclip module.

##### paperclipDOMRecorder.copy()

Copies the Paperclip module to your clipboard.

##### paperclipDOMRecorder.start()

Starts recording all DOM changes as snapshots.

##### paperclipDOMRecorder.stop()

Stops listening to DOM changes.
