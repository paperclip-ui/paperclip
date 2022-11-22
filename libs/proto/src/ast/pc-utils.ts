import { DocumentBodyItem } from "../generated/ast/pc";

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
