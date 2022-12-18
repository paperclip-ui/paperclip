export namespace routes {
  export const dashboard = () => "/";
  export const editor = (filePath: string) =>
    `/?file=${encodeURIComponent(filePath)}`;
}
