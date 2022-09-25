import * as proto from "@paperclip-ui/proto/lib/virt/html_pb";

export interface NodeFactory {
  createElement(tagName: string): HTMLElement;
  createElementNS(ns: string, tagName: string): Element;
  createTextNode(value: string): Text;
}

export class NativeDOMFactory implements NodeFactory {
  createElement(tagName: string) {
    return document.createElement(tagName);
  }
  createElementNS(ns: string, tagName: string) {
    return document.createElementNS(ns, tagName);
  }
  createTextNode(value: string) {
    return document.createTextNode(value);
  }
}
