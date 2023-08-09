// FYI this code is super dumb and can definitely be made faster
import * as html from "@paperclip-ui/proto/lib/generated/virt/html";
import * as css from "@paperclip-ui/proto/lib/generated/virt/css";
import {
  PCModule,
  PCModuleImport,
} from "@paperclip-ui/proto/lib/generated/virt/module";
import { NodeFactory } from "./node-factory";
import {
  createNativeGlobalScript,
  createNativeNode,
  createNativeStyleFromSheet,
  renderSheetText,
  UrlResolver,
} from "./native";
import { memoize } from "@paperclip-ui/common";
import { traverseNativeNode } from "./utils";
import { Html5Entities } from "html-entities";
import { stringifyCSSRule } from "./sheet";
const entities = new Html5Entities();

const IMP_STYLE_INDEX = 0;
const DOC_STYLE_INDEX = 1;
const STAGE_INDEX = 2;

export type FrameInfo = {
  container: HTMLElement;
};

export type RenderFrameOptions = {
  showSlotPlaceholders?: boolean;
  variantIds?: string[];
  selected?: string[];
  domFactory: NodeFactory;
  resolveUrl?: UrlResolver;
};

export const renderFrames = (
  info: PCModule,
  options: RenderFrameOptions
): HTMLElement[] => {
  return info.html.children.map((frame, index) => {
    return renderFrame(info, index, options);
  });
};

export const renderFrame = (
  info: PCModule,
  index: number,
  options: RenderFrameOptions
) => {
  const { documentStyles, importedStyles } = createStyles(info, options);
  const dataFrames = info.html.children;
  return renderFrame2(
    dataFrames[index],
    importedStyles,
    documentStyles,
    options
  );
};

const createStyles = memoize((info: PCModule, options: RenderFrameOptions) => {
  const documentStyles = renderDocumentStyles(info, options);
  const importedStyles = renderImportedStyles(info, options);
  return { documentStyles, importedStyles };
});

const renderFrame2 = (
  node: html.Node,
  importedStyles: HTMLElement,
  documentStyles: HTMLElement,
  options: RenderFrameOptions
) => {
  const frame = options.domFactory.createElement("div");
  Object.assign(frame.style, { width: "100%", height: "100%" });
  frame.appendChild(importedStyles.cloneNode(true));
  frame.appendChild(documentStyles.cloneNode(true));
  const stage = options.domFactory.createElement("div");
  Object.assign(stage.style, { width: "100%", height: "100%" });
  const root = createNativeNode(
    node,
    options.domFactory,
    options.resolveUrl,
    null,
    options.showSlotPlaceholders
  );
  stage.appendChild(root);
  if (options.variantIds != null && root.nodeType === 1) {
    setVariantClass(root as HTMLElement, options.variantIds);
  }
  frame.appendChild(stage);
  return frame;
};

const renderDocumentStyles = (
  info: PCModule,
  { domFactory, resolveUrl }: RenderFrameOptions
) => {
  const container = domFactory.createElement("div");
  container.appendChild(
    createNativeStyleFromSheet(info.css, domFactory, resolveUrl)
  );
  return container;
};

const renderImportedStyles = (info: PCModule, options: RenderFrameOptions) => {
  const container = options.domFactory.createElement("div");
  for (const imp of info.imports) {
    container.appendChild(createScriptFromImport(imp, options));
  }
  return container;
};

const createScriptFromImport = (
  item: PCModuleImport,
  options: RenderFrameOptions
) => {
  if (item.css) {
    const sheet = createNativeStyleFromSheet(
      item.css.css,
      options.domFactory,
      options.resolveUrl
    );

    sheet.setAttribute(`data-source`, item.css.path);
    return sheet;
  } else if (item.globalScript) {
    return createNativeGlobalScript(
      item.globalScript.content,
      item.globalScript.path,
      options.domFactory
    );
  }
};

export const patchFrames = (
  frames: HTMLElement[],
  prev: PCModule,
  curr: PCModule,
  options: RenderFrameOptions
) => {
  if (curr === prev) {
    return frames;
  }
  const prevVirtFrames = prev.html.children;
  const newVirtFrames = curr.html.children;
  const { insert, update } = calcAryPatch(prevVirtFrames, newVirtFrames);
  const newFrames: HTMLElement[] = [];

  for (let i = 0; i < update.length; i++) {
    patchRoot(
      frames[i],
      prev,
      curr,
      prevVirtFrames[i],
      newVirtFrames[i],
      options
    );
    newFrames.push(frames[i]);
  }

  for (const newItem of insert) {
    newFrames.push(renderFrame(curr, newVirtFrames.indexOf(newItem), options));
  }

  return newFrames;
};

export const patchFrame = (
  frame: HTMLElement,
  index: number,
  prev: PCModule,
  curr: PCModule,
  options: RenderFrameOptions
) => {
  const prevVirtFrames = prev.html.children;
  const newVirtFrames = curr.html.children;
  return patchRoot(
    frame,
    prev,
    curr,
    prevVirtFrames[index],
    newVirtFrames[index],
    options
  );
};

export const getFrameRects = (
  mount: HTMLElement,
  info: PCModule,
  index: number
) => {
  const rects: Record<string, any> = {};

  const frame = info.html.children[index] as html.Node;

  const bounds = getFrameBounds(frame) || {
    x: 0,
    y: 0,
    width: 1024,
    height: 768,
  };

  // mount child node _is_ the frame -- can only ever be one child
  traverseNativeNode(
    mount.childNodes[STAGE_INDEX].childNodes[0],
    (node, path) => {
      if (node.nodeType !== 1) {
        return;
      }

      const virtId = (node as HTMLElement).id?.substring(1);
      const clientRect = (node as Element).getBoundingClientRect();

      if (clientRect) {
        rects[virtId] = {
          width: clientRect.width,
          height: clientRect.height,
          x: bounds.x + clientRect.left,
          y: bounds.y + clientRect.top,
        };
      }
    }
  );

  const id = (frame.element || frame.textNode).id;

  // include frame sizes too
  rects[id] = bounds;

  return rects;
};

export const computeAllStyles = (mount: HTMLElement, index: number) => {
  const styles: Record<string, any> = {};

  traverseNativeNode(
    mount.childNodes[STAGE_INDEX].childNodes[0],
    (node: HTMLElement, path) => {
      if (node.nodeType !== Node.ELEMENT_NODE) {
        return;
      }

      const style = window.getComputedStyle(node as HTMLElement);
      const pojo = {};
      for (const prop of style) {
        pojo[prop] = style[prop];
      }

      styles[node.id.substring(1)] = pojo;
    }
  );

  return styles;
};

const setVariantClass = (frame: HTMLElement, variantIds: string[]) => {
  if (variantIds != null && frame.nodeType === 1) {
    const el = frame as Element;
    const className =
      el.getAttribute("data-org-class") || el.getAttribute("class") || "";
    el.setAttribute("data-org-class", className);
    el.setAttribute(
      "class",
      `${className} ${variantIds
        .map((variantId) => {
          return `_variant-${variantId}`;
        })
        .join(" ")}`
    );
  }
};

const patchRoot = (
  frame: HTMLElement,
  prevInfo: PCModule,
  newInfo: PCModule,
  prevVirtNode: html.Node,
  currVirtNode: html.Node,
  options: RenderFrameOptions
) => {
  if (prevInfo.css !== newInfo.css) {
    patchDocumentSheet(frame, prevInfo, newInfo, options);
  }

  if (prevInfo.imports !== newInfo.imports) {
    patchImportedSheets(frame, prevInfo, newInfo, options);
  }

  const prevChildren = [prevVirtNode];
  const currChildren = [currVirtNode];

  const stage = frame.childNodes[STAGE_INDEX] as HTMLElement;

  patchChildren(stage, prevChildren, currChildren, options);

  if (
    options.variantIds &&
    stage.childNodes.length > 0 &&
    stage.childNodes[0].nodeType === 1
  ) {
    setVariantClass(stage.childNodes[0] as HTMLElement, options.variantIds);
  }
};

const patchDocumentSheet = (
  frame: HTMLElement,
  prev: PCModule,
  curr: PCModule,
  options: RenderFrameOptions
) => {
  const styleContainer = frame.childNodes[DOC_STYLE_INDEX] as HTMLDivElement;
  const styleElement = styleContainer.childNodes[0] as HTMLStyleElement;
  patchStyleElement(styleElement, prev.css, curr.css, options);
};

const patchStyleElement = (
  styleElement: HTMLStyleElement,
  prevSheet: css.Document,
  newSheet: css.Document,
  options: RenderFrameOptions
) => {
  if (styleElement.sheet) {
    patchCSSStyleSheet(styleElement.sheet, prevSheet, newSheet, options);
  } else {
    styleElement.textContent = renderSheetText(newSheet, options.resolveUrl);
  }
};

const calcAryPatch = <TItem>(oldItems: TItem[], newItems: TItem[]) => {
  const low = Math.min(oldItems.length, newItems.length);
  const update = Array.from({ length: low }).map((v, i) => [
    oldItems[i],
    newItems[i],
  ]);
  const insert = newItems.slice(oldItems.length);
  const removeCount = Math.max(oldItems.length - newItems.length, 0);

  return { update, insert, removeCount };
};

const patchImportedSheets = (
  frame: HTMLElement,
  prev: PCModule,
  curr: PCModule,
  options: RenderFrameOptions
) => {
  const styleContainer = frame.childNodes[IMP_STYLE_INDEX] as HTMLDivElement;

  const { update, insert, removeCount } = calcAryPatch(
    prev.imports,
    curr.imports
  );

  for (let i = 0; i < update.length; i++) {
    const [oldItem, newItem] = update[i];
    if (oldItem !== newItem) {
      if (oldItem.css) {
        patchStyleElement(
          styleContainer.childNodes[i] as HTMLStyleElement,
          oldItem.css.css,
          newItem.css.css,
          options
        );
      } else {
        const old = styleContainer.childNodes[i];
        styleContainer.insertBefore(
          createScriptFromImport(newItem, options),
          old
        );
        old.remove();
      }
    }
  }

  for (const item of insert) {
    styleContainer.appendChild(createScriptFromImport(item, options));
  }

  for (let i = removeCount; i--; ) {
    styleContainer.lastChild.remove();
  }
};

const patchCSSStyleSheet = (
  sheet: CSSStyleSheet,
  prevSheet: css.Document,
  newSheet: css.Document,
  options: RenderFrameOptions
) => {
  const { update, insert, removeCount } = calcAryPatch(
    prevSheet.rules,
    newSheet.rules
  );

  for (let i = 0; i < update.length; i++) {
    const [oldItem, newItem] = update[i];
    if (
      oldItem !== newItem ||
      (sheet.cssRules[i] as CSSStyleRule).selectorText === ".nil"
    ) {
      sheet.deleteRule(i);
      insertRule(sheet, stringifyCSSRule(newItem, options), i);
    }
  }

  for (const item of insert) {
    insertRule(sheet, stringifyCSSRule(item, options));
  }
  for (let i = removeCount; i--; ) {
    sheet.deleteRule(sheet.cssRules.length - 1);
  }
};

const insertRule = (sheet: CSSStyleSheet, rule: string, index?: number) => {
  const actualIndex = index == null ? sheet.cssRules.length : index;
  try {
    sheet.insertRule(rule, actualIndex);
  } catch (e) {
    sheet.insertRule(".nil{}", actualIndex);
  }
};

const isNodeKindSame = (a: html.Node, b: html.Node) => {
  return (a.element && b.element) || (a.textNode && b.textNode);
};

const patchNode = (
  node: HTMLElement | Text,
  prevVirtNode: html.Node,
  currVirtNode: html.Node,
  options: RenderFrameOptions
) => {
  if (prevVirtNode === currVirtNode) {
    return node;
  }

  if (
    isNodeKindSame(prevVirtNode, currVirtNode) ||
    (prevVirtNode.element &&
      prevVirtNode.element.tagName !== currVirtNode.element?.tagName)
  ) {
    const repl = createNativeNode(
      currVirtNode,
      options.domFactory,
      options.resolveUrl,
      (node as HTMLElement).namespaceURI,
      options.showSlotPlaceholders
    );
    node.parentNode.insertBefore(repl, node);
    node.parentNode.removeChild(node);
  } else {
    if (prevVirtNode.element) {
      patchElement(
        node as HTMLElement,
        prevVirtNode.element,
        currVirtNode.element,
        options
      );
    } else if (currVirtNode.textNode) {
      (node as Text).nodeValue = entities.decode(
        currVirtNode.textNode.value.replace(/[\s\r]+/g, " ")
      );
    }
  }

  return node;
};

const patchElement = (
  node: HTMLElement,
  prev: html.Element,
  curr: html.Element,
  options: RenderFrameOptions
) => {
  patchAttributes(node, prev, curr, options);
  patchChildren(node as HTMLElement, prev.children, curr.children, options);
};

const patchAttributes = (
  node: HTMLElement,
  prev: html.Element,
  curr: html.Element,
  options: RenderFrameOptions
) => {
  for (let { name: key, value } of curr.attributes) {
    if (key === "src" && options.resolveUrl) {
      value = options.resolveUrl(value);
    }
    node.setAttribute(key, value);
  }
  for (const { name: key } of prev.attributes) {
    if (!curr.attributes.some((b) => b.name === key)) {
      node.removeAttribute(key);
    }
  }
};

const patchChildren = (
  parent: HTMLElement,
  prev: html.Node[],
  curr: html.Node[],
  options: RenderFrameOptions
) => {
  const low = Math.min(prev.length, curr.length);

  for (let i = 0; i < low; i++) {
    patchNode(parent.childNodes[i] as any, prev[i], curr[i], options);
  }

  // insert
  if (prev.length < curr.length) {
    for (let i = prev.length; i < curr.length; i++) {
      parent.appendChild(
        createNativeNode(
          curr[i],
          options.domFactory,
          options.resolveUrl,
          null,
          options.showSlotPlaceholders
        )
      );
    }
  } else {
    for (let i = curr.length; i < prev.length; i++) {
      parent.lastChild.remove();
    }
  }
};

export const getFrameBounds = (node: html.Node) => {
  return node.element?.metadata?.bounds || node.textNode?.metadata?.bounds;
};
