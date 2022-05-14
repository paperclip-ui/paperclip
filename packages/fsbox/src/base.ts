export type FSReadResult = {
  content: Buffer;
  mimeType: string;
};

export type FSSandboxFileReader = (uri: string) => Promise<FSReadResult>;

export type FSSandboxEngineOptions = {
  readFile: FSSandboxFileReader;
  writeFile(uri: string, content: Buffer): Promise<boolean>;
};
