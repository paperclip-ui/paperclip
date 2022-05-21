import * as React from "react";

export type FileOpenerOptions = {
  name: string;
  extensions?: string[];
};

export type FileOpener = (options: FileOpenerOptions) => Promise<string>;

export type FrontEndContextOptions = {
  openFile: FileOpener;
};

export const OpenFileContext = React.createContext<FileOpener>(null);
