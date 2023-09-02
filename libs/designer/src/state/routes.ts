type EditorRedirectInfo = {
  filePath: string;
  nodeId?: string;
  declName?: string;
  variantIds?: string[];
};

export namespace routes {
  export const home = () => "/";
  export const editor = ({
    filePath,
    nodeId,
    declName,
    variantIds = [],
  }: EditorRedirectInfo) => {
    const query = {
      file: encodeURIComponent(filePath),
      nodeId,
      declName,
    };

    const params = new URLSearchParams();
    params.set("file", filePath);
    if (nodeId) {
      params.set("nodeId", nodeId);
    }
    if (declName) {
      params.set("declName", declName);
    }
    if (variantIds.length) {
      params.set("variantIds", variantIds.join(","));
    }

    return `/?${params.toString()}`;
  };
}
