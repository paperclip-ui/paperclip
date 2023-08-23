export namespace routes {
  export const dashboard = () => "/";
  export const editor = (filePath: string, nodeId?: string) => {
    let url = `/?file=${encodeURIComponent(filePath)}`;
    if (nodeId) {
      url += "&nodeId=" + nodeId;
    }

    return url;
  };
}
