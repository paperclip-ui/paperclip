import * as html from "@paperclip-ui/proto/lib/generated/virt/html";

export const preventDefault = (event: any) => {
  event.stopPropagation();
  event.preventDefault();
  return false;
};

export const ATTR_ALIASES = {
  className: "class",
};

export const traverseNativeNode = (
  element: Node,
  each: (node: Node, path: number[]) => void,
  cpath: number[] = []
) => {
  each(element, cpath);
  for (let i = 0, { length } = element.childNodes; i < length; i++) {
    const child = element.childNodes[i];
    traverseNativeNode(child, each, [...cpath, i]);
  }
};

export const arraySplice = <TArray extends Array<any>>(
  array: TArray,
  index: number,
  deleteCount: number,
  ...newValues: TArray
) => {
  return [
    ...array.slice(0, index),
    ...newValues,
    ...array.slice(index + deleteCount),
  ];
};

export const getAttrValue = (value: html.Value) =>
  String(value.str?.value ?? value?.num?.value ?? value?.bool?.value);
