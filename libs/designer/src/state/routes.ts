export namespace routes {
  export const home = () => "/";
  export const editor = (filePath: string, nodeId?: string) => {
    let url = `/?file=${encodeURIComponent(filePath)}`;
    if (nodeId) {
      url += "&nodeId=" + nodeId;
    }

    return url;
  };
}
