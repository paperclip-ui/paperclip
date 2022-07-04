import * as path from "path";
import { FSSandboxFileReader } from "./base";

export const setReaderMimetypes =
  (resolve: Record<string, string[]>) =>
  (readFile: FSSandboxFileReader) =>
  async (uri: string) => {
    const { content, mimeType: defaultMimeType } = await readFile(uri);

    for (const mimeType in resolve) {
      const extensions = resolve[mimeType];
      if (extensions.includes(path.extname(uri))) {
        return { content, mimeType };
      }
    }

    return { content, mimeType: defaultMimeType };
  };
