type EditorRedirectInfo = {
  filePath: string;
  nodeId?: string;
  declName?: string;
};

export namespace routes {
  export const home = () => "/";
  export const editor = ({
    filePath,
    nodeId,
    declName,
  }: EditorRedirectInfo) => {
    const query = {
      file: encodeURIComponent(filePath),
      nodeId,
      declName,
    };

    return `/?${Object.keys(query)
      .map((key) => `${key}=${query[key]}`)
      .join("&")}`;
  };
}
