import { ExtensionContext } from "vscode";
import { PaperclipLanguageClient } from "./language/client";

export const activate = (context: ExtensionContext) => {
  new PaperclipLanguageClient(context).activate();
  console.log("ACT");
};

export const deactivate = () => {};
