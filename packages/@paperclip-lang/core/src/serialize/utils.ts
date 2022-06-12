import { camelCase } from "lodash";

export const pascalCase = (buffer: string) =>
  buffer.charAt(0).toUpperCase() + camelCase(buffer.substring(1));
