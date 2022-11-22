import { DocumentBodyItem, Node } from "../generated/ast/pc";

export const getDocumentBodyInner = (item: DocumentBodyItem) => {
  return (
    item.atom ||
    item.component ||
    item.docComment ||
    item.element ||
    item.import ||
    item.style ||
    item.text ||
    item.trigger
  );
};

export const getNodeInner = (item: Node) => {
  return (
    item.element ||
    item.insert ||
    item.override ||
    item.slot ||
    item.style ||
    item.text
  );
};
