import { Graph } from "@paperclip-ui/proto/lib/generated/ast/graph";
import { evaluate as wasmEvaluate } from "../pkg/paperclip_evaluator";

export const evaluate = async (path: string, graph: Graph) => {
  return toProstOutput(await wasmEvaluate(path, fromProstValue(false)(graph)));
};

// band-aid code :P
const fromProstValue = (inner: boolean) => (value: any) => {
  let ret = value;

  if (Array.isArray(value)) return value.map(fromProstValue(inner));
  if (value && typeof value === "object") {
    let newValue = {};
    for (const key in value) {
      let subValue = fromProstValue(/body|node/.test(key))(value[key]);
      newValue[key] = subValue;
    }
    ret = newValue;
  }
  return inner
    ? {
        inner: ret,
      }
    : ret;
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
