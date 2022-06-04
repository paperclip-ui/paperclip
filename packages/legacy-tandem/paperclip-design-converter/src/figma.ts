import * as figma from "figma-js";
import fetch from "node-fetch";
import * as mime from "mime";
import {
  BaseDesign,
  DesignType,
  ConversionOptions,
  ConvertResult,
  ConvertResultItem,
  getResultItemBasename,
  getResultItemRelativePath,
} from "./base";
import {
  PCModule,
  createPCModule,
  PCSourceTagNames,
  xmlToPCNode,
  PAPERCLIP_MODULE_VERSION,
  PCVisibleNodeMetadataKey,
  PCElement,
  PCNode,
  PCComponent,
  elevateCommonStylesToGlobal,
} from "paperclip";
import {
  KeyValue,
  EMPTY_OBJECT,
  EMPTY_ARRAY,
  Point,
  shiftPoint,
  flipPoint,
  appendChildNode,
} from "tandem-common";
import { px } from "./utils";
import { BlendMode } from "figma-js";
import {
  isElementLikePCNode,
  isTextLikePCNode,
  PCVisibleNode,
  PCStyleMixin,
  createPCTextStyleMixin,
  filterTextStyles,
  PCTextLikeNode,
  PCTextNode,
  createPCElementStyleMixin,
} from "paperclip";

export type FigmaDesign = {
  document: figma.Document;
  components: KeyValue<figma.Component>;
  images: KeyValue<ConvertResultItem>;
} & BaseDesign<DesignType.FIGMA>;

type FigmaOpenOptions = {
  figmaToken: string;
  vectorFormat: "svg" | "png";
} & ConversionOptions;

export const isSupportedPath = (
  projectId: string,
  options: { figmaToken?: string }
): options is FigmaOpenOptions => Boolean(options.figmaToken);

const DOWNLOAD_CHUNK_SIZE = 10;
const PC_EXT_NAME = "pc";

export const openDesign = async (
  projectId: string,
  { figmaToken, vectorFormat = "svg" }: FigmaOpenOptions
): Promise<FigmaDesign> => {
  const client = figma.Client({
    personalAccessToken: figmaToken,
  });

  console.log(`Loading figma project: ${projectId}`);

  const {
    data: { document, components },
  } = await client.file(projectId);

  let imageIds: string[] = getFigmaImageIds([], document);
  imageIds = Object.values(components).reduce(getFigmaImageIds, imageIds);

  let loadedImages: KeyValue<ConvertResultItem> = {};

  if (imageIds.length) {
    console.log(
      `Loading ${imageIds.length} ${vectorFormat} image${
        imageIds.length > 1 ? "s" : ""
      }`
    );

    const {
      data: { images },
    } = await client.fileImages(projectId, {
      ids: imageIds,
      scale: 1,
      format: vectorFormat,
      svg_include_id: false,
    });

    const imageIdChunks = imageIds.reduce(
      (chunks, id) => {
        if (chunks[0].length < DOWNLOAD_CHUNK_SIZE) {
          return [[id, ...chunks[0]], ...chunks.slice(1)];
        }
        return [[id], ...chunks];
      },
      [[]]
    );

    for (const imageIdChunk of imageIdChunks) {
      await Promise.all(
        imageIdChunk.map(async (imageId) => {
          const url = images[imageId];
          console.log(`Downloading: ${url}`);
          const response = await fetch(url);
          const data = await new Promise<ConvertResultItem>((resolve) => {
            let buffers = [];
            response.body.on("data", (chunk) => {
              buffers.push(chunk);
            });
            response.body.on("end", () => {
              if (!buffers.length) {
                console.log(`${url} returned empty response.`);
              }
              resolve({
                name: imageId,
                extension: mime.getExtension(
                  response.headers.get("Content-Type")
                ),
                content: Buffer.concat(buffers),
              });
            });
          });
          loadedImages[imageId] = data;
        })
      );
    }
  }

  return {
    document,
    components,
    images: loadedImages,
    type: DesignType.FIGMA,
  };
};

const figmaNodeReducer = <T>(
  reduce: (value: T, node: figma.Node | figma.Component) => T
) => {
  const iter = (value: T, node: figma.Node) => {
    value = reduce(value, node);
    switch (node.type) {
      case "DOCUMENT":
      case "CANVAS":
      case "GROUP":
      case "FRAME": {
        value = node.children.reduce(iter, value);
        break;
      }
    }
    return value;
  };
  return iter;
};

// const { data } = await client.projectFiles(projectId);
const getFigmaImageIds = figmaNodeReducer((vectorIds: string[], node) => {
  let imageRefId: string;
  if (node.type === "VECTOR") {
    imageRefId = node.id;
  } else if (node.type === "RECTANGLE") {
    const fills = node.fills || EMPTY_ARRAY;
    for (const fill of fills) {
      if (fill.type === "IMAGE") {
        imageRefId = node.id;
        break;
      }
    }
  }
  if (imageRefId && vectorIds.indexOf(imageRefId) === -1) {
    return [...vectorIds, imageRefId];
  }

  return vectorIds;
});

export const convertDesign = async (
  design: FigmaDesign,
  options: ConversionOptions
): Promise<ConvertResult> => {
  const { document, components, images } = design;
  const modules = convertDocument(document, design);

  const result: ConvertResultItem[] = Object.values(images);

  // messy, so don't do this.
  // let globalsModule: PCModule = createPCModule();

  for (const pageName in modules) {
    modules[pageName] = elevateComponents(modules[pageName]);
    // [modules[pageName], globalsModule] = elevateCommonStylesToGlobal(modules[pageName], globalsModule);
  }

  if (options.mixinLabelPattern) {
    const tester = new RegExp(
      options.mixinLabelPattern.replace(/([\[\]\{\}])+/g, "\\$1")
    );
    let mixinsModule = createPCModule();
    for (const pageName in modules) {
      [modules[pageName], mixinsModule] = elevateMixinsWithLabelTester(
        modules[pageName],
        mixinsModule,
        tester
      );
    }
    result.push({
      name: "mixins",
      extension: PC_EXT_NAME,
      content: new Buffer(JSON.stringify(mixinsModule, null, 2)),
    });
  }

  if (options.pages) {
    for (const pageName in modules) {
      result.push({
        name: pageName,
        extension: PC_EXT_NAME,
        content: new Buffer(JSON.stringify(modules[pageName], null, 2)),
      });
    }
  }

  return result;
};

const elevateMixinsWithLabelTester = (
  root: PCModule,
  dest: PCModule,
  tester: RegExp
) => {
  const mixins: PCStyleMixin[] = [];
  const map = (node: PCNode) => {
    if (isElementLikePCNode(node) || isTextLikePCNode(node)) {
      let visNode = node as PCVisibleNode;
      if (visNode.label && tester.test(visNode.label)) {
        let updatedStyle = {};
        let mixin: PCStyleMixin;
        const label = visNode.label.replace(tester, "");

        // no need to filter styles since Figma does that for us.
        if (isTextLikePCNode(node)) {
          const text = node as PCTextNode;
          mixin = createPCTextStyleMixin(text.style, text.value, null, label);
        } else if (isElementLikePCNode(node)) {
          const element = node as PCElement;
          mixin = createPCElementStyleMixin(element.style, null, label);
        }
        mixin = cleanId({ ...mixin, id: `mixin_${node.id}` });

        delete mixin.style.left;
        delete mixin.style.top;
        delete mixin.style.display;
        delete mixin.style.width;
        delete mixin.style.height;
        delete mixin.style.position;
        delete mixin.style["box-sizing"];

        mixins.push(mixin);

        visNode = {
          ...visNode,
          style: {},
          label,
          styleMixins: {
            [mixin.id]: {
              priority: 1,
            },
          },
          children: visNode.children.map(map),
        };

        return visNode;
      }
    }

    return {
      ...node,
      children: node.children.map(map),
    };
  };

  root = map(root);
  for (const mixin of mixins) {
    dest = appendChildNode(mixin, dest);
  }
  return [root, dest];
};

const convertDocument = (document: figma.Document, design: FigmaDesign) => {
  const modules: KeyValue<PCModule> = {};
  for (const child of document.children) {
    if (child.type === "CANVAS") {
      modules[child.name] = convertFigmaNode(
        { left: 0, top: 0 },
        design
      )(child);
    }
  }

  return modules;
};

const elevateComponents = (root: PCModule) => {
  const components: PCComponent[] = [];

  const map = (node: PCNode) => {
    if (node.name === PCSourceTagNames.COMPONENT) {
      components.push(node);
      return null;
    }
    return {
      ...node,
      children: node.children.map(map).filter(Boolean),
    };
  };
  root = map(root);

  for (const component of components) {
    root = appendChildNode(component, root);
  }
  return root;
};

const convertFigmaNode =
  (offsetPosition: Point, design: FigmaDesign) => (node: figma.Node) => {
    let pcNode: PCNode;

    switch (node.type) {
      case "CANVAS": {
        pcNode = {
          id: node.id,
          name: PCSourceTagNames.MODULE,
          metadata: EMPTY_OBJECT,
          version: PAPERCLIP_MODULE_VERSION,
          children: node.children
            .map(convertFigmaNode(offsetPosition, design))
            .filter(Boolean),
        };
        break;
      }
      case "FRAME": {
        const position = shiftPoint(
          getFigmaNodePoint(node),
          flipPoint(offsetPosition)
        );

        pcNode = {
          id: node.id,
          is: "div",
          attributes: EMPTY_OBJECT,
          label: node.name,
          metadata: {
            [PCVisibleNodeMetadataKey.BOUNDS]: {
              left: node.absoluteBoundingBox.x,
              top: node.absoluteBoundingBox.y,
              right:
                node.absoluteBoundingBox.x + node.absoluteBoundingBox.width,
              bottom:
                node.absoluteBoundingBox.y + node.absoluteBoundingBox.height,
            },
          },
          name: PCSourceTagNames.ELEMENT,
          style: convertFrameStyle(node),
          children: node.children
            .map(convertFigmaNode(shiftPoint(position, offsetPosition), design))
            .filter(Boolean),
        };
        break;
      }
      case "RECTANGLE": {
        const position = shiftPoint(
          getFigmaNodePoint(node),
          flipPoint(offsetPosition)
        );

        pcNode = {
          id: node.id,
          is: "div",
          attributes: EMPTY_OBJECT,
          name: PCSourceTagNames.ELEMENT,
          children: EMPTY_ARRAY,
          metadata: EMPTY_OBJECT,
          label: node.name,
          style: convertRectangleStyle(node, design, position),
        };
        break;
      }
      case "GROUP": {
        const position = shiftPoint(
          getFigmaNodePoint(node),
          flipPoint(offsetPosition)
        );
        pcNode = {
          id: node.id,
          is: "div",
          attributes: EMPTY_OBJECT,
          name: PCSourceTagNames.ELEMENT,
          children: node.children
            .map(convertFigmaNode(shiftPoint(position, offsetPosition), design))
            .filter(Boolean),
          metadata: EMPTY_OBJECT,
          label: node.name,
          style: convertGroupStyle(node, position),
        };
        break;
      }
      case "TEXT": {
        const position = shiftPoint(
          getFigmaNodePoint(node),
          flipPoint(offsetPosition)
        );
        pcNode = {
          id: node.id,
          label: node.name,
          name: PCSourceTagNames.TEXT,
          // value: node.
          value: node.characters,
          children: EMPTY_ARRAY,
          metadata: EMPTY_OBJECT,
          style: convertTextStyle(node, position),
        };
        break;
      }
      case "VECTOR": {
        const result = design.images[node.id];
        if (!result) {
          console.warn(`Didn't load vector: ${node.id}`);
          return null;
        }
        const image = result.content;
        const position = shiftPoint(
          getFigmaNodePoint(node),
          flipPoint(offsetPosition)
        );

        const style = convertVectorStyle(node, position);

        if (result.extension === "svg") {
          try {
            pcNode = {
              ...xmlToPCNode(image.toString("utf8")),
              style,
              id: node.id,
            };
          } catch (e) {
            console.error(`Unable to parse: ${node.id}`);
            console.error(e.stack);
            console.error(result);
          }
        } else {
          pcNode = {
            name: PCSourceTagNames.ELEMENT,
            attributes: {
              src: "./" + getResultItemRelativePath(result, PC_EXT_NAME),
            },
            children: EMPTY_ARRAY,
            metadata: EMPTY_OBJECT,
            is: "img",
            style,
            id: node.id,
          };
        }
        break;
      }
      case "COMPONENT": {
        const newOffsetPosition = getFigmaNodePoint(node);

        pcNode = {
          id: "component_" + node.id,
          name: PCSourceTagNames.COMPONENT,
          is: "div",
          label: node.name,
          variant: EMPTY_OBJECT,
          style: convertComponentStyle(node, newOffsetPosition),
          attributes: EMPTY_OBJECT,
          metadata: {
            [PCVisibleNodeMetadataKey.BOUNDS]: {
              ...newOffsetPosition,
              right:
                node.absoluteBoundingBox.x + node.absoluteBoundingBox.width,
              bottom:
                node.absoluteBoundingBox.y + node.absoluteBoundingBox.height,
            },
          },
          children: node.children
            .map(
              convertFigmaNode(
                shiftPoint(newOffsetPosition, {
                  left: 0,
                  top: 0,
                }),
                design
              )
            )
            .filter(Boolean),
        };
        break;
      }

      case "INSTANCE": {
        const position = shiftPoint(
          getFigmaNodePoint(node),
          flipPoint(offsetPosition)
        );
        pcNode = {
          id: node.id,
          label: node.name,
          name: PCSourceTagNames.COMPONENT_INSTANCE,
          style: convertInstanceStyle(node, position),
          is: "component_" + node.componentId.replace(/:/g, "_"),
          variant: EMPTY_OBJECT,
          attributes: EMPTY_OBJECT,
          metadata: EMPTY_OBJECT,
          children: EMPTY_ARRAY,
        };
        break;
      }

      default: {
        console.warn(`Unsupported node type: ${node.type}`);
      }
    }

    return pcNode && cleanId(pcNode);
  };

const cleanId = <TNode extends PCNode>(node: TNode): TNode => ({
  ...(node as any),
  id: node.id.replace(/:/g, "_"),
});
const getFigmaNodePoint = (
  node:
    | figma.Frame
    | figma.Rectangle
    | figma.Group
    | figma.Text
    | figma.Vector
    | figma.Component
    | figma.Instance
) => ({
  left: node.absoluteBoundingBox.x,
  top: node.absoluteBoundingBox.y,
});

const convertVectorStyle = (node: figma.Vector, position: Point) => {
  return {
    ...getNodeBoxStyle(node, position),
  };
};

const convertTextStyle = (node: figma.Text, position: Point) => {
  const { fills, style: textStyle } = node;
  let style = { ...getNodeBoxStyle(node, position) };

  let color: string;

  if (fills) {
    for (const fill of fills) {
      if (fill.visible === false) continue;
      if (fill.type === "SOLID") {
        color = convertColor(fill.color);
      }
    }
  }

  style["font-family"] = textStyle.fontFamily;
  style["font-weight"] = textStyle.fontWeight;
  style["font-size"] = textStyle.fontSize;
  style["letter-spacing"] = textStyle.letterSpacing;
  style["line-height"] = px(textStyle.lineHeightPx);

  if (color) {
    style["color"] = color;
  }

  return {
    ...style,
    ...convertBlendMode(node),
    ...convertEffects(node),
  };
};

const convertComponentStyle = (node: figma.Component, position: Point) => {
  return {};
};

const convertInstanceStyle = (node: figma.Instance, position: Point) => {
  return {
    ...getNodeBoxStyle(node, position),
  };
};

const convertFrameStyle = (node: figma.Frame) => {
  return {
    background: convertColor(node.backgroundColor),
  };
};

const convertRectangleStyle = (
  node: figma.Rectangle,
  design: FigmaDesign,
  position: Point
) => {
  const { fills, strokes, strokeWeight, cornerRadius } = node;

  let style = { ...getNodeBoxStyle(node, position) };

  let backgrounds: string[] = [];
  let borders: string[] = [];
  // let backgroundBlendModes: string[]

  if (fills) {
    for (const fill of fills) {
      if (fill.visible === false) continue;
      switch (fill.type) {
        case "GRADIENT_LINEAR": {
          backgrounds.push(convertLinearGradient(fill));
          break;
        }
        case "GRADIENT_RADIAL": {
          backgrounds.push(convertRadialGradient(fill));
          break;
        }
        case "SOLID": {
          backgrounds.push(convertColor(fill.color));
          break;
        }
        case "IMAGE": {
          const image = design.images[node.id];
          if (!image) {
            console.warn(`Didn't load image for Rectangle: ${node.id}`);
          } else {
            backgrounds.push(
              `url(./${getResultItemRelativePath(image, PC_EXT_NAME)})`
            );
          }
          break;
        }
        default: {
          console.warn(`Unsupported fill type: ${fill.type}`);
        }
      }
    }
  }

  if (cornerRadius) {
    style["border-bottom-left-radius"] =
      style["border-top-left-radius"] =
      style["border-bottom-right-radius"] =
      style["border-top-right-radius"] =
        px(cornerRadius);
  }

  if (strokes) {
    for (const stroke of strokes) {
      switch (stroke.type) {
        case "SOLID": {
          borders.push(`${strokeWeight}px solid ${convertColor(stroke.color)}`);
          break;
        }
      }
    }
  }

  if (backgrounds.length) {
    style["background"] = backgrounds.join(", ");
  }

  if (borders.length) {
    style["border"] = borders[0];
  }

  return {
    ...style,
    ...convertBlendMode(node),
    ...convertEffects(node),
  };
};

const convertBlendMode = (node: figma.Rectangle | figma.Text | figma.Group) => {
  const blendMode = String(node.blendMode);
  if (blendMode === "NORMAL") {
    return EMPTY_OBJECT;
  }

  const cssBlendMode = blendMode.replace(/_/g, "-").toLowerCase();

  if (
    !/normal|multiply|screen|overlay|darken|lighten|color-dodge|saturation|color|luminosity/.test(
      cssBlendMode
    )
  ) {
    console.warn(`Unknown blend mode: ${blendMode}`);
    return EMPTY_OBJECT;
  }

  return {
    "mix-blend-mode": cssBlendMode,
  };
};

const convertEffects = (node: figma.Text | figma.Rectangle | figma.Group) => {
  let style = {};
  const { effects } = node;
  const filters: string[] = [];
  const boxShadows: string[] = [];
  if (effects) {
    for (const effect of effects) {
      switch (effect.type) {
        case "LAYER_BLUR": {
          filters.push(`blur(${px(effect.radius)})`);
          break;
        }
        case "DROP_SHADOW": {
          filters.push(`drop-shadow(${convertShadow(effect)})`);
          break;
        }

        case "INNER_SHADOW": {
          boxShadows.push(convertInnerShadow(effect));
          break;
        }
        default: {
          console.warn(`Unsupported effect type: ${effect.type}`);
          break;
        }
      }
    }
  }

  if (filters.length) {
    style["filter"] = filters.join(", ");
  }

  if (boxShadows.length) {
    style["box-shadow"] = boxShadows.join(", ");
  }

  return style;
};

const getNodeBoxStyle = (
  node:
    | figma.Group
    | figma.Rectangle
    | figma.Text
    | figma.Vector
    | figma.Component
    | figma.Instance,
  position: Point
) => ({
  display: node.visible === false ? "none" : "inline-block",
  left: px(position.left),
  top: px(position.top),
  width: px(node.absoluteBoundingBox.width),
  height: px(node.absoluteBoundingBox.height),
  "box-sizing": "border-box",
  position: "absolute",
});

const convertGroupStyle = (group: figma.Group, position: Point) => {
  return {
    ...convertBlendMode(group),
    ...getNodeBoxStyle(group, position),
    ...convertEffects(group),
  };
};

const convertColor = ({ r, g, b, a }: figma.Color) => {
  return `rgba(${r * 255}, ${g * 255}, ${b * 255}, ${a})`;
};

// https://github.com/figma/figma-api-demo/blob/master/figma-to-react/lib/figma.js
const convertLinearGradient = (paint: figma.Paint): string => {
  const handles = paint.gradientHandlePositions;
  const handle0 = handles[0];
  const handle1 = handles[1];

  const ydiff = handle1.y - handle0.y;
  const xdiff = handle0.x - handle1.x;

  const angle = Math.atan2(-xdiff, -ydiff);
  const stops = paint.gradientStops
    .map((stop) => {
      return `${convertColor(stop.color)} ${Math.round(stop.position * 100)}%`;
    })
    .join(", ");
  return `linear-gradient(${angle}rad, ${stops})`;
};

const convertRadialGradient = (paint: figma.Paint) => {
  const stops = paint.gradientStops
    .map((stop) => {
      return `${convertColor(stop.color)} ${Math.round(stop.position * 60)}%`;
    })
    .join(", ");

  return `radial-gradient(${stops})`;
};
const convertShadow = (effect: figma.Effect) => {
  return `${effect.offset.x}px ${effect.offset.y}px ${
    effect.radius
  }px ${convertColor(effect.color)}`;
};

const convertInnerShadow = (effect: figma.Effect) => {
  return `inset ${effect.offset.x}px ${effect.offset.y}px ${
    effect.radius
  }px ${convertColor(effect.color)}`;
};
