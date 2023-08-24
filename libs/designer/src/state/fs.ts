import { FSDirectory, FSItem, FSItemKind } from "./core";

export const setDirItems = (
  curr: FSDirectory,
  cwd: string,
  items: FSItem[]
) => {
  if (cwd.indexOf(curr.path) !== 0) {
    return curr;
  }

  if (curr.path === cwd) {
    return {
      ...curr,
      items,
    };
  }

  const nextRelativePath = cwd.substring(curr.path.length + 1);
  const nextBasename = nextRelativePath.split("/").shift();
  const nextPath = curr.path + "/" + nextBasename;

  let found = curr.items.find((item) => {
    return item.kind === FSItemKind.Directory && item.path === nextPath;
  }) as FSDirectory;

  if (!found) {
    found = {
      kind: FSItemKind.Directory,
      path: nextPath,
      items: [],
    };
    curr = {
      ...curr,
      items: [...curr.items, found],
    };
  }

  return {
    ...curr,
    items: curr.items.map((item) =>
      item === found ? setDirItems(item, cwd, items) : item
    ),
  };
};
