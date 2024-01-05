import React, { useCallback, useEffect, useRef, useState } from "react";
import * as styles from "../ui.pc";
import { useDispatch, useSelector } from "@paperclip-ui/common";
import {
  DNDKind,
  getCuttingExprId,
  getExpandedVirtIds,
  getGraph,
  getTargetExprId,
} from "@paperclip-ui/designer/src/state";
import { ast } from "@paperclip-ui/core/lib/proto/ast/pc-utils";
import { DesignerEvent } from "@paperclip-ui/designer/src/events";
import cx from "classnames";
import { useDrag, useDrop } from "react-dnd";
import { ContextMenu } from "@paperclip-ui/designer/src/ui/logic/ContextMenu";
import { getEntityShortcuts } from "@paperclip-ui/designer/src/domains/shortcuts/state";
import { NativeTypes } from "react-dnd-html5-backend";
import { FSItem } from "@paperclip-ui/proto/lib/generated/service/designer";
import { isImageAsset } from "@paperclip-ui/designer/src/domains/ui/state";

type DropHotSpot = "inside" | "before" | "after";
const BORDER_MARGIN = 10;

type LeafProps = {
  children?: () => any;
  className: string;
  id?: string;
  depth: number;
  text: any;
  altText?: any;
  controls?: any;
  instanceOf?: string[];
};

export const Leaf = (props: LeafProps) => {
  const { children, className, depth, text, altText, controls, instanceOf } =
    props;
  const {
    selected,
    open,
    onClick,
    contextMenu,
    cutting,
    onArrowClick,
    setHeaderRef,
    labelRef,
    style,
    dropHotSpot,
  } = useLeaf(props);

  const shadow = instanceOf != null;
  return (
    <styles.TreeNavigationItem style={style}>
      <ContextMenu menu={contextMenu} onOpen={onClick}>
        <div style={{ width: "100%" }}>
          <styles.LayerNavigationItemHeader
            container={null}
            ref={setHeaderRef}
            class={cx(className, {
              open,
              cutting,
              selected,
              shadow,
              showDropTop: dropHotSpot === "before",
              showDropOver: dropHotSpot === "inside",
              showDropBottom: dropHotSpot === "after",
            })}
            style={{ "--depth": depth }}
            onClick={onClick}
            onArrowClick={onArrowClick}
            controls={controls}
          >
            <span ref={labelRef}>{text}</span>
            {altText}
          </styles.LayerNavigationItemHeader>
        </div>
      </ContextMenu>
      {open && children && children()}
    </styles.TreeNavigationItem>
  );
};

const useLeaf = ({ id: targetId, instanceOf }: LeafProps) => {
  const virtId = targetId && [...(instanceOf || []), targetId].join(".");
  const open = useSelector(getExpandedVirtIds).includes(virtId);
  const selectedId = useSelector(getTargetExprId);
  const cuttingId = useSelector(getCuttingExprId);

  const cutting = cuttingId === targetId;

  const graph = useSelector(getGraph);

  const contextMenu = useCallback(
    () => getEntityShortcuts(targetId, graph),
    [targetId, graph]
  );

  const selected = selectedId === virtId;

  const headerRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const [dropHotSpot, setDropHotSpot] = useState<DropHotSpot>(null);

  const [{ opacity }, dragRef] = useDrag(
    () => ({
      type: DNDKind.Node,
      item: { id: targetId },
      collect: (monitor) => ({
        opacity: monitor.isDragging() ? 0.5 : 1,
        cursor: monitor.isDragging() ? "copy" : "initial",
      }),
    }),
    []
  );

  const [{ isDraggingOver }, dropRef] = useDrop(
    {
      accept: [DNDKind.Node, DNDKind.Resource, DNDKind.File, NativeTypes.FILE],
      hover: ({ id: draggedExprId }, monitor) => {
        if (monitor.getItemType() === DNDKind.Node) {
          const offset = monitor.getClientOffset();
          const rect = headerRef.current?.getBoundingClientRect();

          if (offset && rect && monitor.isOver() && monitor.canDrop()) {
            let isTop = offset.y < rect.top + BORDER_MARGIN;
            let isBottom = offset.y > rect.bottom - BORDER_MARGIN;

            const expr = ast.getExprInfoById(targetId, graph);
            const draggedExpr = ast.getExprInfoById(draggedExprId, graph);

            // can only insert before or after text nodes
            if (
              [ast.ExprKind.TextNode].includes(expr.kind) ||
              [
                ast.ExprKind.Atom,
                ast.ExprKind.Trigger,
                ast.ExprKind.Style,
                ast.ExprKind.Component,
              ].includes(draggedExpr.kind)
            ) {
              isTop = offset.y < rect.top + rect.height / 2;
              isBottom = offset.y > rect.top + rect.height / 2;
            }

            setDropHotSpot(isTop ? "before" : isBottom ? "after" : "inside");
          } else {
            setDropHotSpot(null);
          }
        } else {
          setDropHotSpot("inside");
        }
      },
      drop(item: any, monitor) {
        dispatch({
          type: "ui/exprNavigatorDroppedNode",
          payload: {
            position: dropHotSpot,
            targetId,
            item: {
              kind: monitor.getItemType() as any,
              item,
            },
          },
        });
      },
      canDrop(item: any, monitor) {
        if (monitor.getItemType() === NativeTypes.FILE) {
          return true;
        }
        if (monitor.getItemType() === DNDKind.File) {
          const fileItem = item as FSItem;
          return isImageAsset(fileItem.path);
        }
        if (monitor.getItemType() === DNDKind.Resource) {
          return true;
        }

        if (item.id === targetId) {
          return false;
        }

        // don't allow dropping a node into a node that is already in it
        const draggedExpr = ast.getExprInfoById(item.id, graph);

        return ast.flattenExpressionInfo(draggedExpr)[targetId] == null;
      },
      collect(monitor) {
        return {
          isDraggingOver: monitor.isOver(),
        };
      },
    },
    [graph, dropHotSpot]
  );

  useEffect(() => {
    if (!isDraggingOver) {
      setDropHotSpot(null);
    }
  }, [isDraggingOver]);

  useEffect(() => {
    if (selected) {
      headerRef.current.scrollIntoView({
        block: "nearest",
      });
    }
  }, [selected]);

  const dispatch = useDispatch<DesignerEvent>();
  const onClick = useCallback(() => {
    dispatch({ type: "ui/layerLeafClicked", payload: { virtId } });
  }, [virtId]);

  const onArrowClick = useCallback(
    (event: React.MouseEvent<any>) => {
      event.stopPropagation();
      dispatch({ type: "ui/layerArrowClicked", payload: { virtId } });
    },
    [virtId]
  );

  const setHeaderRef = useCallback(
    (el) => {
      headerRef.current = el;
      dragRef(el);
      dropRef(el);
    },
    [dragRef, dropRef]
  );

  return {
    onClick,
    onArrowClick,
    contextMenu,
    cutting,
    dropHotSpot,
    setHeaderRef,
    labelRef,
    style: { opacity },
    open,
    selected,
  };
};
