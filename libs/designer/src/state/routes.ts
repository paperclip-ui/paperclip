type EditorRedirectInfo = {
  filePath?: string;
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
  }: EditorRedirectInfo = {}) => {
    const params = new URLSearchParams();
    if (filePath) {
      params.set("file", filePath);
    }
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
