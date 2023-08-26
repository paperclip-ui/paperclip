export enum PromptKind {
  NewDesignFile,
  RenameFile,
  NewDirectory,
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
export type RenameFile = BasePromptDetails<PromptKind.RenameFile> & {
  filePath: string;
};

export type PromptDetails =
  | NewDesignFilePromptDetails
  | RenameFile
  | NewDirectoryPromptDetails;

export type Prompt = {
  title: string;
  okLabel: string;
  placeholder: string;
  details: PromptDetails;
};

export const newDesignFilePrompt = (parentDirectory?: string): Prompt => ({
  details: { kind: PromptKind.NewDesignFile, parentDirectory },
  title: "New design file",
  placeholder: "design file name",
  okLabel: "Create design file",
});

export const renameFilePrompt = (filePath: string): Prompt => ({
  details: { kind: PromptKind.RenameFile, filePath },
  title: "Rename name",
  placeholder: "New file name",
  okLabel: "Rename file",
});

export const newDirectoryPrompt = (parentDirectory?: string): Prompt => ({
  details: { kind: PromptKind.NewDirectory, parentDirectory },
  title: "New directory",
  placeholder: "directory name",
  okLabel: "Create directory",
});
