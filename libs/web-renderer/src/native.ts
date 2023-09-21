import * as html from "@paperclip-ui/proto/lib/generated/virt/html";
import * as css from "@paperclip-ui/proto/lib/generated/virt/css";
import { Html5Entities } from "html-entities";
import { preventDefault, ATTR_ALIASES, getAttrValue } from "./utils";
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
  node: html.Node,
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
  sheet: css.Document,
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
    if (content) {
      const css = factory.createElement("style") as HTMLStyleElement;
      css.textContent = content;
      return css;
    } else {
      const link = factory.createElement("link") as HTMLLinkElement;
      link.rel = "stylesheet";
      link.href = path;
      return link;
    }
  } else if (/\.js/.test(path)) {
    const script = factory.createElement("script") as HTMLScriptElement;
    script.type = "text/javascript";
    script.textContent = content;

    // execute immmediately in case of custom elements
    // document.body.appendChild(script);
    return script;
  }
  // other things not supported yet
  return factory.createDocumentFragment();
};

export const renderSheetText = (
  sheet: css.Document,
  resolveUrl: UrlResolver
) => {
  return sheet.rules
    .map((rule) => stringifyCSSRule(rule, { resolveUrl }))
    .map((text) => {
      // OOF! This is expensive! This should be done in the rust engine instead. Not here!
      const isValid = ruleIsValid(text);

      return isValid ? text : ".invalid-rule { }";
    })
    .join("\n");
};

const createNativeTextNode = (node: html.TextNode, factory: NodeFactory) => {
  // fixes https://github.com/paperclipui/paperclip/issues/609
  const wrapper = document.createElement("span");

  // needed for overriding styles
  wrapper.id = "_" + node.id;
  wrapper.appendChild(
    factory.createTextNode(entities.decode(node.value.replace(/[\s\r]+/g, " ")))
  );
  return wrapper;
};

const createNativeElement = (
  element: html.Element,
  factory: NodeFactory,
  resolveUrl: UrlResolver,
  namespaceUri?: string,
  showSlotPlaceholders?: boolean,
  inInstance?: boolean
) => {
  const nativeElement = (
    element.tagName === "svg"
      ? factory.createElementNS(XMLNS_NAMESPACE, "svg")
      : namespaceUri
      ? factory.createElementNS(namespaceUri, element.tagName)
      : factory.createElement(element.tagName)
  ) as HTMLElement;

  const childNamespaceUri =
    element.tagName === "svg" ? XMLNS_NAMESPACE : namespaceUri;

  nativeElement.id = "_" + element.id;

  for (let { name, value } of element.attributes) {
    let strValue = getAttrValue(value);
    if (name === "src" && resolveUrl) {
      strValue = resolveUrl(strValue);
    }

    const aliasName = ATTR_ALIASES[name] || name;

    nativeElement.setAttribute(aliasName, strValue);
  }

  for (const child of element.children) {
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
