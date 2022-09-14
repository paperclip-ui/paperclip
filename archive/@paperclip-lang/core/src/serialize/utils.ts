import { camelCase } from "lodash";

export const pascalCase = (buffer: string) => {
  const newName = getName(buffer);
  return newName.charAt(0).toUpperCase() + newName.substring(1);
};

export const getName = (label: string) => {
  label = label.trim();
  return isNaN(Number(label.charAt(0)))
    ? camelCase(label)
    : "l" + camelCase(label);
};
