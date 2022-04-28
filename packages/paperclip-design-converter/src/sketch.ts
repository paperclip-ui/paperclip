import { BaseDesign, DesignType, ConversionOptions } from "./base";
import { createPCModule, PCVisibleNodeMetadataKey } from "paperclip";
import * as ns from "node-sketch";
import { appendChildNode, EMPTY_OBJECT } from "tandem-common";
import { PCNode, PCSourceTagNames } from "paperclip";

const EMPTY_ARRAY = [];

export type SketchDesign = {
  document: any;
  pages: any[];
  user: any;
  meta: any;
} & BaseDesign<DesignType.SKETCH>;

export const openDesign = async (filePath: string): Promise<SketchDesign> => {
  const result = await ns.read(filePath);
  return {
    type: DesignType.SKETCH,
    pages: result.pages,
    document: result.document,
    user: null,
    meta: null
  };
};

export const isSupportedPath = (path: string) => {
  return /\.sketch$/.test(String(path));
};

export const convertDesign = async (
  design: SketchDesign,
  options: ConversionOptions
) => {
  let module = createPCModule();

  module = design.pages.reduce((module, page) => {
    return mapPage(page).reduce((page, child) => {
      return appendChildNode(child, module);
    }, module);
  }, module);

  return {
    [options.mainPageFileName || "design.pc"]: module
  };
};

const mapPage = (page: any): PCNode[] => {
  return page.layers.map(mapLayer);
};

const mapLayer = (layer: any): PCNode => {
  switch (layer._class) {
    case "text": {
      return {
        name: PCSourceTagNames.TEXT,
        id: layer.do_objectID.replace(/-/g, ""),
        value: layer.attributedString.string,
        style: mapStyle(layer),
        metadata: EMPTY_OBJECT,
        children: EMPTY_ARRAY,
        label: layer.name
      };
    }
    case "rectangle":
    case "group": {
      return {
        name: PCSourceTagNames.ELEMENT,
        id: layer.do_objectID.replace(/-/g, ""),
        is: "div",
        label: layer.name,
        attributes: EMPTY_OBJECT,
        style: mapStyle(layer),
        metadata: EMPTY_OBJECT,
        children: (layer.layers || EMPTY_ARRAY).map(mapLayer).filter(Boolean)
      };
    }
    case "artboard": {
      return {
        name: PCSourceTagNames.ELEMENT,
        id: layer.do_objectID.replace(/-/g, ""),
        is: "div",
        attributes: EMPTY_OBJECT,
        label: layer.name,
        style: mapStyle(layer),
        metadata: {
          [PCVisibleNodeMetadataKey.BOUNDS]: {
            left: layer.frame.x,
            top: layer.frame.y,
            right: layer.frame.x + layer.frame.width,
            bottom: layer.frame.y + layer.frame.height
          }
        },
        children: (layer.layers || EMPTY_ARRAY).map(mapLayer).filter(Boolean)
      };
    }
    case "oval":
    case "shapeGroup":
    case "shapePath": {
      return null;
      // return {
      //   name: PCSourceTagNames.ELEMENT,
      //   id: "svg" + layer.do_objectID.replace(/-/g, ""),
      //   is: "svg",
      //   attributes: {
      //     width: `${layer.frame.width}px`,
      //     height: `${layer.frame.height}px`,
      //     version: "1.1",
      //     xmlns: "http://www.w3.org/2000/svg",
      //     "xmlns:xlink": "http://www.w3.org/1999/xlink"
      //   },
      //   style: {
      //     position: "absolute",
      //     left: `${layer.frame.x}px`,
      //     top: `${layer.frame.y}px`
      //   },
      //   children: [mapSVG(layer, true)],
      //   metadata: EMPTY_OBJECT,
      //   label: layer.name
      // }
    }
    default: {
      // throw new Error(`Unsupported layer type: ${layer._class}`);
    }
  }
};

const mapSVG = (layer: any, isRoot?: boolean) => {
  switch (layer._class) {
    case "shapeGroup": {
      break;
    }

    case "oval": {
      break;
    }

    case "shapePath": {
      const { points } = layer;
      break;
    }
  }
  return null;
};

const mapStyle = (layer: any) => {
  const { style } = layer;
  let convertedStyle: any = {
    "box-sizing": "border-box"
  };

  if (layer.frame) {
    convertedStyle.position = "absolute";
    convertedStyle.left = `${layer.frame.x.toFixed(2)}px`;
    convertedStyle.top = `${layer.frame.y.toFixed(2)}px`;
    convertedStyle.width = `${layer.frame.width.toFixed(2)}px`;
    convertedStyle.height = `${layer.frame.height.toFixed(2)}px`;
  }

  if (!style) {
    return convertedStyle;
  }
  const { fixedRadius, isVisible } = layer;
  const { blur, shadows, borders, fills, textStyle, contextSettings } = style;
  const filters: string[] = [];

  if (!isVisible) {
    convertedStyle["display"] = "none";
  }

  if (fixedRadius) {
    convertedStyle["border-top-left-radius"] = convertedStyle[
      "border-bottom-left-radius"
    ] = convertedStyle["border-top-right-radius"] = convertedStyle[
      "border-bottom-right-radius"
    ] = `${fixedRadius}px`;
  }

  if (contextSettings) {
    if (contextSettings.opacity) {
      convertedStyle["opacity"] = Number(contextSettings.opacity.toFixed(2));
    }
  }

  if (textStyle) {
    const font =
      textStyle.encodedAttributes.MSAttributedStringFontAttribute.attributes;
    const color = textStyle.encodedAttributes.MSAttributedStringColorAttribute;

    if (font) {
      convertedStyle["font-family"] = font.name;
      convertedStyle["font-size"] = `${font.size}px`;
    }
    if (color) {
      convertedStyle["color"] = mapColor(color);
    }
    convertedStyle["letter-spacing"] = textStyle.encodedAttributes.kerning;
  }

  if (shadows) {
    convertedStyle["box-shadow"] = shadows
      .map(({ offsetX, offsetY, blurRadius, spread, color }) => {
        return `${offsetX}px ${offsetY}px ${blurRadius}px ${spread}px ${mapColor(
          color
        )}`;
      })
      .join(",");
  }

  if (borders) {
    // todo - possibly use box shadows here instead
    for (const { color, thickness, isEnabled } of borders) {
      if (isEnabled) {
        convertedStyle.border = `${thickness}px solid ${mapColor(color)}`;
      }
    }
  }

  if (fills) {
    for (const { color, gradient, fillType } of fills) {
      // solid
      if (fillType === 0) {
        convertedStyle["background"] = mapColor(color);

        // gradient
      } else if (fillType === 1) {
        const from = gradient.from
          .match(/\{(.*?),(.*?)\}/)
          .slice(1)
          .map(Number);
        const to = gradient.to
          .match(/\{(.*?),(.*?)\}/)
          .slice(1)
          .map(Number);
        const angle = calcAngle(from, to);

        // calcLayerLength(layer.frame.width, layer.frame.height, angle);
        const stops = gradient.stops.map(({ color, position, ...rest }) => {
          // TODO - position length should be to - from distance + angle + max angle length
          return `${mapColor(color)} ${Math.round(position * 100)}%`;
        });
        convertedStyle[
          "background-image"
        ] = `linear-gradient(${angle}deg, ${stops.join(", ")})`;
      }
    }
  }

  if (filters.length) {
    convertedStyle.filter = filters.join(", ");
  }

  return convertedStyle;
};

const calcLayerLength = (width, height, angle) => {
  const [cx, cy] = [width / 2, height / 2];
  // console.log(angle);
};

const calcAngle = ([fx, fy]: number[], [tx, ty]: number[]) => {
  const angleRadians = Math.atan2(ty - fy, tx - fx);
  const angleDeg = ((angleRadians + Math.PI / 2) * 180) / Math.PI;
  return angleDeg;
};

const mapColor = ({ red, blue, green, alpha }) =>
  `rgba(${Math.round(red * 255)}, ${Math.round(green * 255)}, ${Math.round(
    blue * 255
  )}, ${alpha.toFixed(2)})`;
