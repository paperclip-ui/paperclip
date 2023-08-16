import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as styles from "@paperclip-ui/designer/src/styles/left-sidebar.pc";
import { useDispatch, useSelector } from "@paperclip-ui/common";
import {
  DNDKind,
  getExpandedVirtIds,
  getGraph,
  getSelectedId,
} from "@paperclip-ui/designer/src/state";
import { ast } from "@paperclip-ui/proto-ext/lib/ast/pc-utils";
import { DesignerEvent } from "@paperclip-ui/designer/src/events";
import cx from "classnames";
import { useDrag, useDrop } from "react-dnd";
import { ContextMenu } from "@paperclip-ui/designer/src/components/ContextMenu";
import { getEntityShortcuts } from "@paperclip-ui/designer/src/domains/shortcuts/state";

type DropHotSpot = "inside" | "before" | "after";
const BORDER_MARGIN = 10;

export const Leaf = ({
  children,
  className,
  id,
  depth,
  text,
  controls,
  instanceOf,
}: {
  children?: () => any;
  className: string;
  id: string;
  depth: number;
  text: any;
  controls?: any;
  instanceOf: string[];
}) => {
  const {
    selected,
    open,
    onClick,
    contextMenu,
    onArrowClick,
    headerRef,
    style,
    dragRef,
    dropRef,
    dropHotSpot,
  } = useLeaf({
    exprId: id,
    instanceOf,
  });

  const shadow = instanceOf != null;
  return (
    <styles.TreeNavigationItem style={style}>
      <ContextMenu menu={contextMenu}>
        <div>
          <styles.LayerNavigationItemHeader
            ref={(e) => {
              dropRef(e);
              dragRef(e);
              headerRef.current = e;
            }}
            class={cx(className, {
              open,
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
            {text}
          </styles.LayerNavigationItemHeader>
        </div>
      </ContextMenu>
      {open && children && children()}
    </styles.TreeNavigationItem>
  );
};

const useLeaf = ({
  exprId,
  instanceOf,
}: {
  exprId: string;
  instanceOf: string[];
}) => {
  const virtId = [...(instanceOf || []), exprId].join(".");
  const open = useSelector(getExpandedVirtIds).includes(virtId);
  const selectedId = useSelector(getSelectedId);
  const graph = useSelector(getGraph);

  const contextMenu = useCallback(
    () => getEntityShortcuts(exprId, graph),
    [exprId, graph]
  );

  const selected = selectedId === virtId;

  const headerRef = useRef<HTMLDivElement>(null);
  const [dropHotSpot, setDropHotSpot] = useState<DropHotSpot>(null);

  const [{ opacity }, dragRef] = useDrag(
    () => ({
      type: DNDKind.Node,
      item: { id: exprId },
      collect: (monitor) => ({
        opacity: monitor.isDragging() ? 0.5 : 1,
        cursor: monitor.isDragging() ? "copy" : "initial",
      }),
    }),
    []
  );

  const [{ isDraggingOver }, dropRef] = useDrop(
    {
      accept: DNDKind.Node,
      hover: (_, monitor) => {
        const offset = monitor.getClientOffset();
        const rect = headerRef.current?.getBoundingClientRect();

        if (offset && rect && monitor.isOver() && monitor.canDrop()) {
          let isTop = offset.y < rect.top + BORDER_MARGIN;
          let isBottom = offset.y > rect.bottom - BORDER_MARGIN;

          const expr = ast.getExprInfoById(exprId, graph);

          // can only insert before or after text nodes
          if (expr.kind === ast.ExprKind.TextNode) {
            isTop = offset.y < rect.top + rect.height / 2;
            isBottom = offset.y > rect.top + rect.height / 2;
          }

          setDropHotSpot(isTop ? "before" : isBottom ? "after" : "inside");
        } else {
          setDropHotSpot(null);
        }
      },
      drop(item: any) {
        dispatch({
          type: "ui/exprNavigatorDroppedNode",
          payload: {
            position: dropHotSpot,
            targetId: exprId,
            droppedExprId: item.id,
          },
        });
      },
      canDrop({ id: draggedExprId }, _monitor) {
        if (draggedExprId === exprId) {
          return false;
        }

        // don't allow dropping a node into a node that is already in it
        const draggedExpr = ast.getExprInfoById(draggedExprId, graph);
        return ast.flattenExpressionInfo(draggedExpr)[exprId] == null;
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

  return {
    onClick,
    onArrowClick,
    contextMenu,
    dropHotSpot,
    headerRef,
    dragRef,
    dropRef,
    style: { opacity },
    open,
    selected,
  };
};
