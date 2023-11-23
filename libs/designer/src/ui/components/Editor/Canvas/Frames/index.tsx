import React, { useCallback } from "react";
import { computeAllStyles, getFrameRects } from "@paperclip-ui/web-renderer";
import { memo } from "react";
import { Frame } from "./Frame";
import { useDispatch, useSelector } from "@paperclip-ui/common";
import {
  getEditorState,
  getCurrentDocument,
  getSelectedVariantIds,
  StyleOverrides,
  getGraph,
  AtomOverrides,
} from "@paperclip-ui/designer/src/state";
import { PCModule } from "@paperclip-ui/proto/lib/generated/virt/module";
import { Node } from "@paperclip-ui/proto/lib/generated/virt/html";
import { Graph } from "@paperclip-ui/proto/lib/generated/ast/graph";
import { ast } from "@paperclip-ui/proto-ext/lib/ast/pc-utils";
import { Atom } from "@paperclip-ui/proto/lib/generated/ast/pc";

type FramesProps = {
  expandedFrameIndex?: number | null;
};

export const Frames = memo(({ expandedFrameIndex }: FramesProps) => {
  const {
    currentDocument: doc,
    styleOverrides,
    atomOverrides,
  } = useSelector(getEditorState);
  const graph = useSelector(getGraph);

  const extraHTML = generateStyleOverrideHTML(
    styleOverrides,
    atomOverrides,
    graph
  );

  const { frames, variantIds, onFrameLoaded, onFrameUpdated } = useFrames({
    shouldCollectRects: true,
  });

  return (
    <>
      {frames.map((frame: Node, i) => {
        const id = (frame.element || frame.textNode).id;

        return (
          <Frame
            key={id}
            document={doc!.paperclip!}
            onLoad={onFrameLoaded}
            variantIds={variantIds}
            onUpdate={onFrameUpdated}
            extraHTML={extraHTML}
            expanded={expandedFrameIndex === i}
            frameIndex={i}
            preview={frame}
          />
        );
      })}
    </>
  );
});

const generateStyleOverrideHTML = (
  styleOverrides: StyleOverrides,
  atomOverrides: AtomOverrides,
  graph: Graph
) => {
  if (!styleOverrides) {
    return "";
  }

  let html = "";

  html += "<style>\n";

  for (const id in styleOverrides) {
    const expr = ast.getExprInfoById(id, graph);

    // defensive
    if (!expr) {
      continue;
    }

    const decls = styleOverrides[id];

    if (expr.kind === ast.ExprKind.Style) {
      html += ":root {\n";
      for (const key in decls) {
        const declExpr = expr.expr.declarations.find(
          (decl) => decl.name === key
        );
        if (!declExpr) {
          continue;
        }
        const name = `--${expr.expr.name}-${key}-${declExpr.id}`;

        html += `    ${name}: ${castDeclValue(decls[key])} !important;\n`;
      }
      html += "}\n\n";
    } else {
      // regular selector

      html += `  #_${id} {\n`;

      for (const key in decls) {
        html += `    ${key}: ${castDeclValue(decls[key])} !important;\n`;
      }
      html += "  }\n\n";
    }
  }

  html += `:root {\n`;

  for (const id in atomOverrides) {
    const expr: Atom = ast.getExprById(id, graph);

    if (!expr) {
      continue;
    }

    html += `  --${expr.name}-${expr.id}: ${castDeclValue(
      atomOverrides[id]
    )} !important;\n`;
  }

  html += "}\n\n";

  html += "</style>";

  return html;
};

const castDeclValue = (value: string | number) =>
  typeof value === "number" ? value + "px" : value;

type UseFramesProps = {
  shouldCollectRects: boolean;
};

const useFrames = ({ shouldCollectRects = true }: UseFramesProps) => {
  const doc = useSelector(getCurrentDocument);
  const dispatch = useDispatch();
  const variantIds = useSelector(getSelectedVariantIds);

  const emitFrameRects = useCallback(
    (mount: HTMLElement, data: PCModule, frameIndex: number) => {
      if (!shouldCollectRects) {
        return false;
      }

      const rects = getFrameRects(mount, data, frameIndex);

      // This is not used right now, so we're commenting this out for now
      // since it's expensive. We may eventually want to use something like this at a
      // later point, but will want to figure out a more performant way of doing this (such as computing styles on canvas click)
      // const computedStyles = computeAllStyles(mount, frameIndex);
      dispatch({
        type: "ui/rectsCaptured",
        payload: { frameIndex, rects },
      });
      // dispatch({
      //   type: "ui/computedStylesCaptured",
      //   payload: computedStyles,
      // });
    },
    [dispatch, shouldCollectRects]
  );

  const onFrameUpdated = (
    mount: HTMLElement,
    data: PCModule,
    index: number
  ) => {
    emitFrameRects(mount, data, index);
  };

  const onFrameLoaded = useCallback(
    (mount: HTMLElement, data: PCModule, index: number) => {
      emitFrameRects(mount, data, index);
    },
    [emitFrameRects]
  );

  if (!doc?.paperclip) {
    return { frames: [], onFrameLoaded };
  }

  const frames: Node[] = doc.paperclip?.html?.children || [];

  return { frames, onFrameLoaded, onFrameUpdated, variantIds };
};
