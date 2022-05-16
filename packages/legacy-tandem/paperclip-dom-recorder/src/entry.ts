import { PCDOMRecorder } from "recorder";

const recorder = new PCDOMRecorder();

window["paperclipDOMRecorder"] = recorder;

recorder.takeSnapshot();
recorder.copy();
