import { memoize } from "@paperclip-ui/common";
import {  Obj, Value } from "../generated/virt/html";


export const jsonToMetadataValue = memoize((value: any): any => {
    if (Array.isArray(value)) {
      return {
        ary: {
          items: value.map(jsonToMetadataValue),
        },
      };
    } else if (typeof value === "object") {
      const properties: any[] = [];
      for (const key in value) {
        properties.push({
          name: key,
          value: jsonToMetadataValue(value[key])
        })
      }
      return { obj: {properties} };
    } else if (typeof value === "string") {
      return { str: {value} };
    } else if (typeof value === "number") {
      return { num: {value} };
    }
    return { bool: {value} };
  });
  
  
  export const metadataValueToJSON = memoize((value: Value) => {
    if (value.obj) {
      return metadataValueMapToJSON(value.obj);
    }
    if (value.ary) {
      return value.ary.items.map(metadataValueToJSON);
    }
    return (value.bool ?? value.num ?? value.str)?.value;
  });
  
  export const metadataValueMapToJSON = memoize((map: Obj): any => {
    if (!map) {
      return {};
    }

  
    const values = {};
    for (const {name, value} of map.properties) {
      values[name] = metadataValueToJSON(value);

    }

    return values;
    
  });