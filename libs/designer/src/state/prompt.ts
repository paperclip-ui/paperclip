import { ast } from "@paperclip-ui/core/lib/src/proto/ast/pc-utils";

export enum PromptKind {
  NewDesignFile,
  ConvertToComponent,
  RenameFile,
  NewDirectory,
  ConvertToSlot,
}

export type BasePromptDetails<Kind extends PromptKind> = {
  kind: Kind;
};

export type NewDesignFilePromptDetails =
  BasePromptDetails<PromptKind.NewDesignFile> & {
    parentDirectory?: string;
  };
export type NewDirectoryPromptDetails =
  BasePromptDetails<PromptKind.NewDirectory> & {
    parentDirectory: string;
  };
export type ConvertToComponentDetails =
  BasePromptDetails<PromptKind.ConvertToComponent> & {
    exprId: string;
  };

export type ConvertToSlotDetails =
  BasePromptDetails<PromptKind.ConvertToSlot> & {
    exprId: string;
  };

export type RenameFile = BasePromptDetails<PromptKind.RenameFile> & {
  filePath: string;
};

export type PromptDetails =
  | NewDesignFilePromptDetails
  | ConvertToSlotDetails
  | RenameFile
  | ConvertToComponentDetails
  | NewDirectoryPromptDetails;

export type Prompt = {
  title: string;
  okLabel: string;
  placeholder: string;
  defaultValue?: string;
  details: PromptDetails;
};

export const newDesignFilePrompt = (parentDirectory?: string): Prompt => ({
  details: { kind: PromptKind.NewDesignFile, parentDirectory },
  title: "New design file",
  placeholder: "design file name",
  okLabel: "Create design file",
});

export const newConvertToComponentPrompt = (
  expr: ast.InnerExpressionInfo
): Prompt => ({
  details: { kind: PromptKind.ConvertToComponent, exprId: expr.expr.id },
  title: "Convert to component",
  placeholder: "component name",
  defaultValue: pascalCase(getExprName(expr)),
  okLabel: "Convert to component",
});

const pascalCase = (str: string) => {
  return str?.length > 0 ? str[0].toUpperCase() + str.slice(1) : null;
};

const getExprName = (expr: ast.InnerExpressionInfo) => {
  if (
    expr.kind === ast.ExprKind.Element ||
    expr.kind === ast.ExprKind.TextNode
  ) {
    return expr.expr.name;
  }
  return null;
};

export const renameFilePrompt = (filePath: string): Prompt => ({
  details: { kind: PromptKind.RenameFile, filePath },
  title: "Rename name",
  placeholder: "New file name",
  okLabel: "Rename file",
});

export const newDirectoryPrompt = (parentDirectory: string): Prompt => ({
  details: { kind: PromptKind.NewDirectory, parentDirectory },
  title: "New directory",
  placeholder: "directory name",
  okLabel: "Create directory",
});

export const newConvertToSlotPrompt = (exprId?: string): Prompt => ({
  details: { kind: PromptKind.ConvertToSlot, exprId },
  title: "Convert to slot",
  placeholder: "slot name",
  okLabel: "Convert toslot",
});
