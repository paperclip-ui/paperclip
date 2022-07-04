export const stripProtocol = (uri: string) => uri.replace(/^\w+:\/\//, "");
export const addProtocol = (protocol: string, uri: string) =>
  protocol + "//" + stripProtocol(uri);

export const FILE_PROTOCOL = "file:";
