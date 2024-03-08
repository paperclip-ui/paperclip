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

  return context;
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
    case "VECTOR":
      return writeVector(node, context);
  }

  // console.log(node.type, "CONT");

  return context;
};

const writeVector = async (node: VectorNode, context: Context) => {
  const resource = await node.exportAsync();
  const resourceName = getVectorName(node.name, context);

  context = addResource(resourceName, resource.buffer, context);
  context = addBuffer(`div`, context);
  const style = {
    // "background-image": `url(${resourceName})`,
    "background-repeat": "no-repeat",
    "background-size": "100%",
    width: node.width + "px",
    height: node.height + "px",
  };

  context = await writeBlock(async (context) => {
    return writeStyle(style, context);
  }, context);

  context = addBuffer("\n", context);

  return context;
};

const writeText = async (node: TextNode, context: Context) => {
  context = addBuffer("span", context);

  context = await writeBlock(async (context) => {
    const textSegments = node.getStyledTextSegments([
      "fontSize",
      "fontName",
      "fontWeight",
      "textDecoration",
      "textCase",
      "lineHeight",
      "letterSpacing",
      "fills",
      "textStyleId",
      "fillStyleId",
      "listOptions",
      "indentation",
      "hyperlink",
    ]);

    for (const segment of textSegments) {
      const lines = segment.characters.split("\n");

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (line.trim() !== "") {
          context = addBuffer(`text ${JSON.stringify(line)}`, context);
          context = await writeBlock(async (context) => {
            context = await writeStyle(getTextSegmentStyle(segment), context);
            return context;
          }, context);

          context = addBuffer("\n", context);
        }

        if (i < line.length - 1) {
          context = addBuffer("br\n", context);
        }
      }
    }
    return context;
  }, context);

  return context;
};

const getTextSegmentStyle = (segment: Partial<StyledTextSegment>) => {
  const style = {};

  if (segment.fontName) {
    style["font-family"] = segment.fontName.family;
    style["font-style"] = segment.fontName.style;
  }

  if (segment.fontSize) {
    style["font-size"] = segment.fontSize + "px";
  }

  if (segment.fontWeight) {
    style["font-weight"] = segment.fontWeight;
  }

  if (segment.letterSpacing) {
    // style["letter-spacing"] = segment.letterSpacing.value + (segment.letterSpacing.unit === "PIXELS" ? "px" : "%");
  }

  if (segment.lineHeight?.unit !== "AUTO") {
    // style["line-height"] = segment.lineHeight.value +  (segment.letterSpacing.unit === "PIXELS" ? "px" : "%");
  }

  return style;
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
  if (context.isRoot) {
    context = writeFrameBounds(node, context);
  }

  context = addBuffer(`div ${camelCase(node.name)}`, context);

  context = await writeBlock(async (context) => {
    context = await writeNodeStyle(node, context);
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

const writeNodeStyle = async (node: SceneNode, context: Context) => {
  const parent = node.parent;
  const style = await node.getCSSAsync();

  const allStyles = { ...style };

  if (!node.visible) {
    allStyles.display = "none";
  }

  // relative so that all children are positioned correctly
  if (node.type === "GROUP") {
    allStyles.position = "relative";
  }

  // GROUP's don't have auto layout, so
  if (!context.isRoot) {
    if (
      parent.type === "GROUP" ||
      (parent.type === "FRAME" && parent.layoutMode === "NONE")
    ) {
      const x = node.absoluteBoundingBox.x - parent.absoluteBoundingBox.x;
      const y = node.absoluteBoundingBox.y - parent.absoluteBoundingBox.y;
      // const [[_1, _2, x], [_3, _4, y]] = node.relativeTransform;
      allStyles.position = "absolute";
      allStyles.left = `${x}px`;
      allStyles.top = `${y}px`;
    }
  }

  context = await writeStyle(allStyles, context);

  return context;
};

const writeStyle = async (style: Record<string, string>, context: Context) => {
  context = addBuffer(`style {\n`, context);
  context = startBlock(context);

  for (const key in style) {
    const value = style[key];
    if (/path\-to\-image/.test(value)) {
      continue;
    }

    context = addBuffer(`${key}: ${stripComments(value)}\n`, context);
  }

  context = endBlock(context);
  context = addBuffer(`}\n`, context);

  return context;
};

const stripComments = (value: string) => {
  return String(value).replace(/\/\*.*?\*\//g, "");
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
  context = { ...context, isRoot: false };
  // for (let i = children.length; i--;) {
  for (const node of children) {
    // const node = children[i];
    context = await writeNode(node, context);
  }

  // timeout so that the app doesn't freeze
  await timeout(0);
  return context;
};

const timeout = async (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

type Context = {
  indent: string;
  content: string;
  line: number;
  isNewLine: boolean;
  resources: Record<string, ArrayBuffer>;
  isRoot: boolean;
};

const createContext = (): Context => ({
  indent: "  ",
  content: "",
  line: 0,
  isNewLine: false,
  resources: {},
  isRoot: true,
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

const getResourceName = (name: string, ext: string, context: Context) => {
  const baseName = camelCase(name);

  let newName = baseName + "." + ext;
  let i = 1;
  while (context.resources[newName]) {
    newName = baseName + i + "." + ext;
    i++;
  }

  return newName;
};

const getVectorName = (name: string, context: Context) => {
  return getResourceName(name, "svg", context);
};

const addResource = (name: string, content: ArrayBuffer, context: Context) => {
  const resources = { ...context.resources };

  resources[name] = content;

  return {
    ...context,
    resources,
  };
};
