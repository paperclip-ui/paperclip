import { memoize } from "./memoization";
import * as crc32 from "crc32";

export const EMPTY_OBJECT: any = {};
export const EMPTY_ARRAY: any[] = [];

export const stringifyObject = memoize(obj => {
  const tobj = typeof obj;
  if (Array.isArray(obj)) {
    return `[${obj.map(v => stringifyObject(v)).join(",")}]`;
  } else if (tobj === "object") {
    if (obj) {
      const keys = Object.keys(obj);
      return `{${keys
        .map(key => `"${key}": ${stringifyObject(obj[key])}`)
        .join(",")}}`;
    } else {
      return `null`;
    }
  }
  return JSON.stringify(obj);
});
