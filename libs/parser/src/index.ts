import { parse_pc } from "../pkg/paperclip_parser";
import { Document } from "@paperclip-ui/proto/lib/generated/ast/pc";

export const parsePC = (source: string, seed: string): Document => {
  const doc = toProstOutput(parse_pc(source, seed));
  return doc;
};

const toProstOutput = (obj: any) => {
  if (Array.isArray(obj)) {
    return obj.map(toProstOutput);
  }
  if (obj && typeof obj === "object") {
    let newObj = {};
    for (const key in obj) {
      if (key === "inner") {
        newObj = toProstOutput(obj[key]);
      } else {
        newObj[key] = toProstOutput(obj[key]);
      }
    }
    return newObj;
  }
  return obj;
};
