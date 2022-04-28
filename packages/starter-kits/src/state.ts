import { KeyValue } from "tandem-common";

export type ProjectTemplate = {
  id: string;
  icon: string;
  label: string;
  description: string;
};

export type ProjectFileCreator = (options: Object) => KeyValue<string>;
