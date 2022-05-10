"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bubbleHTMLIframeEvents = void 0;
var transform_1 = require("./transform");
function bubbleHTMLIframeEvents(iframe, options) {
  if (options === void 0) {
    options = {};
  }
  var window = iframe.contentWindow;
  var body = window.document.childNodes[0];
  var translateMousePositions = options.translateMousePositions !== false;
  // TODO - this should be in its own util function
  function bubbleEvent(event) {
    if (
      /key|input/.test(event.type) &&
      options.ignoreInputEvents &&
      (/textarea|input/i.test(event.target.nodeName) ||
        event.target.contentEditable === "true")
    ) {
      return;
    }
    var clonedEvent = new Event(event.type, {
      bubbles: true,
      cancelable: true,
    });
    var rect = iframe.getBoundingClientRect();
    var actualRect = (0, transform_1.calculateAbsoluteBounds)(iframe);
    var zoom = rect.width / (actualRect.right - actualRect.left);
    for (var key in event) {
      var value = event[key];
      if (typeof value === "function") {
        value = value.bind(event);
      }
      if (translateMousePositions) {
        if (key === "pageX" || key === "clientX") {
          value = rect.left + value * zoom;
        }
        if (key === "pageY" || key === "clientY") {
          value = rect.top + value * zoom;
        }
      }
      // bypass read-only issues here
      try {
        clonedEvent[key] = value;
      } catch (e) {}
    }
    iframe.dispatchEvent(clonedEvent);
    if (clonedEvent.defaultPrevented) {
      event.preventDefault();
    }
  }
  var eventTypes = [
    "keypress",
    "copy",
    // these bust react-dnd, so don't use them
    // "dragenter",
    // "dragexit",
    // "dragend",
    // "dragover",
    // "drop",
    "paste",
    "mousemove",
    "mousedown",
    "contextmenu",
    "mouseup",
    "keyup",
    "keydown",
    "paste",
    "touchstart",
    "touchmove",
    "touchend",
  ];
  for (var _i = 0, eventTypes_1 = eventTypes; _i < eventTypes_1.length; _i++) {
    var eventType = eventTypes_1[_i];
    body.addEventListener(eventType, bubbleEvent);
  }
  if (options.ignoreScrollEvents !== true) {
    window.addEventListener("wheel", bubbleEvent);
    window.addEventListener("scroll", bubbleEvent);
    window.addEventListener("touchmove", bubbleEvent);
    window.addEventListener("touchstart", bubbleEvent);
    window.addEventListener("touchend", bubbleEvent);
  }
}
exports.bubbleHTMLIframeEvents = bubbleHTMLIframeEvents;
//# sourceMappingURL=iframe.js.map
