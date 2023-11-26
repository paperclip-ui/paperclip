import { memoize } from "@paperclip-ui/common";
import { MetadataValue, MetadataValueMap } from "../generated/virt/html";

export const jsonToMetadataValue = memoize((value: any): any => {
    if (Array.isArray(value)) {
      return {
        list: {
          items: value.map(jsonToMetadataValue),
        },
      };
    } else if (typeof value === "object") {
      const map = {};
      for (const key in value) {
        map[key] = jsonToMetadataValue(value[key]);
      }
      return { map: {value} };
    } else if (typeof value === "string") {
      return { str: value };
    } else if (typeof value === "number") {
      return { num: value };
    }
    return { bool: value };
  });
  
  
  export const metadataValueToJSON = memoize((value: MetadataValue) => {
    if (value.map) {
      return metadataValueMapToJSON(value.map);
    }
    if (value.list) {
      return value.list.items.map(metadataValueToJSON);
    }
    return value.bool ?? value.num ?? value.str;
  });
  
  export const metadataValueMapToJSON = memoize((map: MetadataValueMap): any => {
    if (!map) {
      return {};
    }
  
    const values = {};
    for (const key in map.value) {
      values[key] = metadataValueToJSON(map.value[key]);
    }
    return values;
    
  });