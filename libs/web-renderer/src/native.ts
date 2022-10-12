import * as html from "@paperclip-ui/proto/lib/virt/html_pb";
import * as css from "@paperclip-ui/proto/lib/virt/css_pb";
import { Html5Entities } from "html-entities";
import { preventDefault, ATTR_ALIASES } from "./utils";
import { NodeFactory } from "./node-factory";
import { stringifyCSSRule } from "./sheet";

const entities = new Html5Entities();

export type DOMNodeMap = Map<Node, string>;
const XMLNS_NAMESPACE = "http://www.w3.org/2000/svg";

export const getNativeNodePath = (root: Node, node: Node) => {
  const path: number[] = [];

  let current = node;

  while (current.parentNode !== root) {
    path.unshift(
      Array.prototype.indexOf.call(current.parentNode.childNodes, current)
    );
    current = current.parentNode;
  }

  return path;
};

export type UrlResolver = (url: string) => string;

export const createNativeNode = (
  node: html.Node.AsObject,
  factory: NodeFactory,
  resolveUrl: UrlResolver,
  namespaceURI: string,
  showSlotPlaceholders: boolean,
  inInstance?: boolean
) => {
  if (!node) {
    return factory.createTextNode("");
  }
  try {
    if (node.element) {
      return createNativeElement(
        node.element,
        factory,
        resolveUrl,
        namespaceURI,
        showSlotPlaceholders,
        inInstance
      );
    } else if (node.textNode) {
      const text = createNativeTextNode(node.textNode, factory);
      return text;
    }
    // switch () {
    // case VirtualNodeKind.Text: {
    // }
    // case VirtualNodeKind.Element:

    // case VirtualNodeKind.StyleElement:
    //   return createNativeStyleFromSheet(node.sheet, factory, resolveUrl);
    // case VirtualNodeKind.Fragment:
    //   return createNativeFragment(
    //     node,
    //     factory,
    //     resolveUrl,
    //     showSlotPlaceholders,
    //     inInstance
    //   );
    // case VirtualNodeKind.Slot: {
    //   return createSlot(node, factory, showSlotPlaceholders, inInstance);
    // }
    // }
  } catch (e) {
    return factory.createTextNode(String(e.stack));
  }
};

let _dummyStyle: HTMLStyleElement;

export const addInsert = (element: HTMLElement) => {
  element.setAttribute(
    "style",
    "border: 1px dashed #F0F; padding: 30px; box-sizing: border-box;"
  );
};

const ruleIsValid = (ruleText: string) => {
  if (typeof window === "undefined") {
    return true;
  }

  if (!_dummyStyle) {
    _dummyStyle = document.createElement("style") as HTMLStyleElement;
    document.head.appendChild(_dummyStyle);
  }

  try {
    (_dummyStyle.sheet as any).insertRule(ruleText, 0);
    (_dummyStyle.sheet as any).deleteRule(0);
  } catch (e) {
    return false;
  }

  return true;
};

export const createNativeStyleFromSheet = (
  sheet: css.Document.AsObject,
  factory: NodeFactory,
  resolveUrl: UrlResolver
) => {
  const nativeElement = factory.createElement("style") as HTMLStyleElement;

  nativeElement.textContent = renderSheetText(sheet, resolveUrl);

  return nativeElement as HTMLStyleElement;
};

export const createNativeGlobalScript = (
  content: string,
  path: string,
  factory: NodeFactory
) => {
  if (/\.css$/.test(path)) {
    const css = factory.createElement("style") as HTMLStyleElement;
    css.textContent = content;
    return css;
  }
  // other things not supported yet
  return document.createDocumentFragment();
};

export const renderSheetText = (
  sheet: css.Document.AsObject,
  resolveUrl: UrlResolver
) => {
  return sheet.rulesList
    .map((rule) => stringifyCSSRule(rule, { resolveUrl }))
    .map((text) => {
      // OOF! This is expensive! This should be done in the rust engine instead. Not here!
      const isValid = ruleIsValid(text);

      // if (!isValid) {
      //   console.error(`invalid CSS rule: ${text}`);
      // }
      return isValid ? text : ".invalid-rule { }";
    })
    .join("\n");
};

const createNativeTextNode = (node, factory: NodeFactory) => {
  // fixes https://github.com/paperclipui/paperclip/issues/609
  return factory.createTextNode(
    entities.decode(node.value.replace(/[\s\r]+/g, " "))
  );
};

const createNativeElement = (
  element: html.Element.AsObject,
  factory: NodeFactory,
  resolveUrl: UrlResolver,
  namespaceUri?: string,
  showSlotPlaceholders?: boolean,
  inInstance?: boolean
) => {
  const nativeElement = (
    element.tagName === "svg"
      ? document.createElementNS(XMLNS_NAMESPACE, "svg")
      : namespaceUri
      ? factory.createElementNS(namespaceUri, element.tagName)
      : factory.createElement(element.tagName)
  ) as HTMLElement;

  const childNamespaceUri =
    element.tagName === "svg" ? XMLNS_NAMESPACE : namespaceUri;

  for (let { name, value } of element.attributesList) {
    if (name === "src" && resolveUrl) {
      value = resolveUrl(value);
    }

    const aliasName = ATTR_ALIASES[name] || name;

    nativeElement.setAttribute(aliasName, value);
  }

  for (const child of element.childrenList) {
    nativeElement.appendChild(
      createNativeNode(
        child,
        factory,
        resolveUrl,
        childNamespaceUri,
        showSlotPlaceholders
        // inInstance ||
        //   Boolean(element.sourceInfo && element.sourceInfo.instanceOf)
      )
    );
  }

  // prevent redirects & vscode from asking to redirect.
  if (element.tagName === "a") {
    nativeElement.onclick = preventDefault;
    nativeElement.onmouseup = preventDefault;
    nativeElement.onmousedown = preventDefault;
  }

  return nativeElement;
};
