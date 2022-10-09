// FYI this code is super dumb and can definitely be made faster
import * as html from "@paperclip-ui/proto/lib/virt/html_pb";
import * as css from "@paperclip-ui/proto/lib/virt/css_pb";
import { PCModule } from "@paperclip-ui/proto/lib/virt/module_pb";
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
  domFactory: NodeFactory;
  resolveUrl?: UrlResolver;
};

export const renderFrames = (
  info: PCModule.AsObject,
  options: RenderFrameOptions
): HTMLElement[] => {
  return getFragmentChildren(info.html).map((frame, index) => {
    return renderFrame(info, index, options);
  });
};

export const renderFrame = (
  info: PCModule.AsObject,
  index: number,
  options: RenderFrameOptions
) => {
  const { documentStyles, importedStyles } = createStyles(info, options);
  const dataFrames = getFragmentChildren(info.html);
  return renderFrame2(
    dataFrames[index],
    importedStyles,
    documentStyles,
    options
  );
};

const createStyles = memoize(
  (info: PCModule.AsObject, options: RenderFrameOptions) => {
    const documentStyles = renderDocumentStyles(info, options);
    const importedStyles = renderImportedStyles(info, options);
    return { documentStyles, importedStyles };
  }
);

const renderFrame2 = (
  node: html.Node.AsObject,
  importedStyles: HTMLElement,
  documentStyles: HTMLElement,
  options: RenderFrameOptions
) => {
  const frame = options.domFactory.createElement("div");
  frame.appendChild(importedStyles.cloneNode(true));
  frame.appendChild(documentStyles.cloneNode(true));
  const stage = options.domFactory.createElement("div");
  stage.appendChild(
    createNativeNode(
      node,
      options.domFactory,
      options.resolveUrl,
      null,
      options.showSlotPlaceholders
    )
  );
  frame.appendChild(stage);
  return frame;
};

const renderDocumentStyles = (
  info: PCModule.AsObject,
  { domFactory, resolveUrl }: RenderFrameOptions
) => {
  const container = domFactory.createElement("div");
  container.appendChild(
    createNativeStyleFromSheet(info.css, domFactory, resolveUrl)
  );
  return container;
};

const renderImportedStyles = (
  info: PCModule.AsObject,
  { domFactory, resolveUrl }: RenderFrameOptions
) => {
  const container = domFactory.createElement("div");
  for (const imp of info.importsList) {
    if (imp.css) {
      const sheet = createNativeStyleFromSheet(
        imp.css.css,
        domFactory,
        resolveUrl
      );
      sheet.setAttribute(`data-source`, imp.css.path);
      // sheet.setAttribute(`data-index`, String(imp.index));
      container.appendChild(sheet);
    } else if (imp.globalScript) {
      container.appendChild(
        createNativeGlobalScript(
          imp.globalScript.content,
          imp.globalScript.path,
          domFactory
        )
      );
    }
  }
  return container;
};

export const patchFrames = (
  frames: HTMLElement[],
  prev: PCModule.AsObject,
  curr: PCModule.AsObject,
  options: RenderFrameOptions
) => {
  if (curr === prev) {
    return frames;
  }
  const prevVirtFrames = getFragmentChildren(prev.html);
  const newVirtFrames = getFragmentChildren(curr.html);
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
  prev: PCModule.AsObject,
  curr: PCModule.AsObject,
  options: RenderFrameOptions
) => {
  const prevVirtFrames = getFragmentChildren(prev.html);
  const newVirtFrames = getFragmentChildren(curr.html);
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
  info: PCModule.AsObject,
  index: number
) => {
  const rects: Record<string, any> = {};

  const frame = getFragmentChildren(info.html)[index] as html.Node.AsObject;

  // const bounds = getFrameBounds(frame);

  // mount child node _is_ the frame -- can only ever be one child
  traverseNativeNode(
    mount.childNodes[STAGE_INDEX].childNodes[0],
    (node, path) => {
      const pathStr = path.length ? index + "." + path.join(".") : index;
      let clientRect: DOMRect;
      if (node.nodeType === 1) {
        clientRect = (node as Element).getBoundingClientRect();
      } else if (node.nodeType === 3) {
        const range = document.createRange();
        range.selectNode(node);
        clientRect = range.getBoundingClientRect();
        range.detach();
      }

      if (clientRect) {
        rects[pathStr] = {
          width: clientRect.width,
          height: clientRect.height,
          x: clientRect.left,
          y: clientRect.top,
        };
      }
    }
  );

  // include frame sizes too
  // rects[index] = bounds;

  return rects;
};

const patchRoot = (
  frame: HTMLElement,
  prevInfo: PCModule.AsObject,
  newInfo: PCModule.AsObject,
  prevVirtNode: html.Node.AsObject,
  currVirtNode: html.Node.AsObject,
  options: RenderFrameOptions
) => {
  if (prevInfo.css !== newInfo.css) {
    patchDocumentSheet(frame, prevInfo, newInfo, options);
  }

  if (prevInfo.importsList !== newInfo.importsList) {
    patchImportedSheets(frame, prevInfo, newInfo, options);
  }

  const prevChildren = getFragmentChildren(prevVirtNode);
  const currChildren = getFragmentChildren(currVirtNode);

  patchChildren(
    frame.childNodes[STAGE_INDEX] as HTMLElement,
    prevChildren,
    currChildren,
    options
  );
};

const patchDocumentSheet = (
  frame: HTMLElement,
  prev: PCModule.AsObject,
  curr: PCModule.AsObject,
  options: RenderFrameOptions
) => {
  const styleContainer = frame.childNodes[DOC_STYLE_INDEX] as HTMLDivElement;
  const styleElement = styleContainer.childNodes[0] as HTMLStyleElement;
  patchStyleElement(styleElement, prev.css, curr.css, options);
};

const patchStyleElement = (
  styleElement: HTMLStyleElement,
  prevSheet: css.Document.AsObject,
  newSheet: css.Document.AsObject,
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
  prev: PCModule.AsObject,
  curr: PCModule.AsObject,
  options: RenderFrameOptions
) => {
  const styleContainer = frame.childNodes[IMP_STYLE_INDEX] as HTMLDivElement;

  const { update, insert, removeCount } = calcAryPatch(
    prev.importsList,
    curr.importsList
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
      }
    }
  }

  for (const item of insert) {
    if (item.css) {
      styleContainer.appendChild(
        createNativeStyleFromSheet(
          item.css.css,
          options.domFactory,
          options.resolveUrl
        )
      );
    }
  }

  for (let i = removeCount; i--; ) {
    styleContainer.lastChild.remove();
  }
};

const patchCSSStyleSheet = (
  sheet: CSSStyleSheet,
  prevSheet: css.Document.AsObject,
  newSheet: css.Document.AsObject,
  options: RenderFrameOptions
) => {
  const { update, insert, removeCount } = calcAryPatch(
    prevSheet.rulesList,
    newSheet.rulesList
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

const isNodeKindSame = (a: html.Node.AsObject, b: html.Node.AsObject) => {
  return (a.element && b.element) || (a.textNode && b.textNode);
};

const patchNode = (
  node: HTMLElement | Text,
  prevVirtNode: html.Node.AsObject,
  currVirtNode: html.Node.AsObject,
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
  prev: html.Element.AsObject,
  curr: html.Element.AsObject,
  options: RenderFrameOptions
) => {
  patchAttributes(node, prev, curr, options);
  patchChildren(
    node as HTMLElement,
    prev.childrenList,
    curr.childrenList,
    options
  );
};

const patchAttributes = (
  node: HTMLElement,
  prev: html.Element.AsObject,
  curr: html.Element.AsObject,
  options: RenderFrameOptions
) => {
  for (let { name: key, value } of curr.attributesList) {
    if (key === "src" && options.resolveUrl) {
      value = options.resolveUrl(value);
    }
    node.setAttribute(key, value);
  }
  for (const { name: key } of prev.attributesList) {
    if (!curr.attributesList.some((b) => b.name === key)) {
      node.removeAttribute(key);
    }
  }
};

const patchChildren = (
  parent: HTMLElement,
  prev: html.Node.AsObject[],
  curr: html.Node.AsObject[],
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

const getFragmentChildren = (node: any): html.Node.AsObject[] =>
  node.childrenList || node.element?.childrenList;
