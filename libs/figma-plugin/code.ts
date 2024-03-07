// https://github.com/maxmartynov/figma-plugin-copy-prototype-link

figma.showUI(__html__);

figma.ui.onmessage = async (message) => {
  if (message.type === "copySelected") {
    figma.ui.postMessage({
      type: "selectionCopied",
      payload: await copySelected(),
    });
  }
};

const copySelected = async () => {
  let context: Context = createContext();

  for (const node of figma.currentPage.selection) {
    context = await writeNode(node, context);
  }

  console.log(context.content);

  return context.content;
};

const writeNode = async (node: SceneNode, context: Context) => {
  switch (node.type) {
    case "TEXT":
      return writeText(node, context);
    case "GROUP":
      return writeGroup(node, context);
    case "FRAME":
      return writeGroup(node, context);
    case "RECTANGLE":
      return writeRectangle(node, context);
    case "INSTANCE":
      return writeInstance(node, context);
  }

  return context;
};

const writeText = async (node: TextNode, context: Context) => {
  context = addBuffer(`text ${JSON.stringify(node.characters)}`, context);

  context = await writeBlock(async (context) => {
    context = await writeStyle(node, context);
    return context;
  }, context);

  context = addBuffer(`\n`, context);
  return context;
};

const writeBlock = async (
  write: (context: Context) => Promise<Context>,
  context: Context
) => {
  context = addBuffer(` {\n`, context);
  context = await writeInner(write, context);
  context = addBuffer(`}`, context);
  return context;
};

const writeInner = async (
  write: (context: Context) => Promise<Context>,
  context: Context
) => {
  context = startBlock(context);
  context = await write(context);
  context = endBlock(context);
  return context;
};

const writeRectangle = async (node: RectangleNode, context: Context) => {
  return context;
};

const writeInstance = async (node: InstanceNode, context: Context) => {
  context = await writeGroup(node, context);
  return context;
};

const writeGroup = async (
  node: GroupNode | FrameNode | InstanceNode,
  context: Context
) => {
  if (node.parent.type === "PAGE") {
    context = writeFrameBounds(node, context);
  }

  context = addBuffer(`div ${camelCase(node.name)}`, context);

  context = await writeBlock(async (context) => {
    context = await writeStyle(node, context);

    return writeChildren(node.children, context);
  }, context);

  context = addBuffer(`\n`, context);

  return context;
};

const writeFrameBounds = (node: SceneNode, context: Context) => {
  context = addBuffer(`/**\n`, context);
  context = addBuffer(
    `* @frame(x:${node.x}, y: ${node.y}, width: ${node.width}, height: ${node.height})\n`,
    context
  );
  context = addBuffer(`*/\n`, context);
  return context;
};

const writeStyle = async (node: SceneNode, context: Context) => {
  const parent = node.parent;
  const style = await node.getCSSAsync();

  const allStyles = { ...style };

  context = addBuffer(`style {\n`, context);
  context = startBlock(context);

  // relative so that all children are positioned correctly
  if (node.type === "GROUP") {
    allStyles.position = "relative";
  }

  // GROUP's don't have auto layout, so
  if (parent.type === "GROUP") {
    allStyles.position = "absolute";
    allStyles.left = `${node.x}px`;
    allStyles.top = `${node.y}px`;
  }

  for (const key in allStyles) {
    context = addBuffer(`${key}: ${stripComments(allStyles[key])}\n`, context);
  }
  context = endBlock(context);
  context = addBuffer(`}\n`, context);
  return context;
};

const stripComments = (value: string) => {
  return value.replace(/\/\*.*?\*\//g, "");
};

const camelCase = (value: string) => {
  let buffer = value
    .split(" ")
    .map(
      (value) =>
        value.charAt(0).toUpperCase() + value.substring(1).toLowerCase()
    )
    .join("")
    .replace(/[^\w_]/g, "");
  buffer = buffer.charAt(0).toLowerCase() + buffer.substring(1);
  return buffer;
};

const writeChildren = async (
  children: readonly SceneNode[],
  context: Context
) => {
  for (const node of children) {
    context = await writeNode(node, context);
  }
  return context;
};

type Context = {
  indent: string;
  content: string;
  line: number;
  isNewLine: boolean;
};

const createContext = (): Context => ({
  indent: "  ",
  content: "",
  line: 0,
  isNewLine: false,
});

const addBuffer = (value: string, context: Context): Context => ({
  ...context,
  content:
    context.content +
    (context.isNewLine ? context.indent.repeat(context.line) : "") +
    value,
  isNewLine: value.charAt(value.length - 1) === "\n",
});

const startBlock = (context: Context): Context => ({
  ...context,
  line: context.line + 1,
});

const endBlock = (context: Context): Context => ({
  ...context,
  line: context.line - 1,
});
