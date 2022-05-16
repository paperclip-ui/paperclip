import * as fs from "fs";
import * as path from "path";
import { kebabCase } from "lodash";
import { PCModule } from "paperclip";

export enum DesignType {
  SKETCH,
  FIGMA,
}

export type BaseDesign<TType extends DesignType> = {
  type: TType;
};

export type ConversionOptions = {
  mainPageFileName?: string;
  symbols: boolean;
  colors: boolean;
  pages: boolean;
  styleMixins: boolean;
  exports: boolean;
  mixinLabelPattern?: string;
};

export type ConvertResultItem = {
  name: string;
  extension: string;
  content: Buffer;
};

export type ConvertResult = ConvertResultItem[];

export const getResultItemBasename = ({
  name,
  extension,
}: ConvertResultItem) => {
  return kebabCase(name) + "." + extension;
};

export const getResultItemRelativePath = (
  item: ConvertResultItem,
  toType?: string
) => {
  const basename = getResultItemBasename(item);
  return item.extension === "pc"
    ? basename
    : !toType || toType === "pc"
    ? path.join("assets", basename)
    : basename;
};
