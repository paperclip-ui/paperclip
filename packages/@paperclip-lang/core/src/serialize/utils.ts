import { camelCase } from "lodash";

export const pascalCase = (buffer: string) => {
  buffer = buffer.trim();
  return buffer.charAt(0).toUpperCase() + getName(buffer.substring(1));
};

export const getName = (label: string) => {
  label = label.trim();
  return isNaN(Number(label.charAt(0)))
    ? camelCase(label)
    : "l" + camelCase(label);
};
