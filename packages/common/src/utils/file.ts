export const resolveFilePath = (relativePath: string, fromPath: string) => {
  const pp1 = fromPath.split(/[\\/]/);
  const pp2 = relativePath.split(/[\\/]/);
  pp1.pop();

  if (pp2[0] === ".") {
    pp2.shift();
  } else {
    while (pp2[0] === "..") {
      pp2.shift();
      pp1.pop();
    }
  }

  return [...pp1, ...pp2].join("/");
};

export const normalizeFilePath = (filePath: string) => {
  return filePath.replace(/[\\]/g, "/").replace("C:/", "/");
};
