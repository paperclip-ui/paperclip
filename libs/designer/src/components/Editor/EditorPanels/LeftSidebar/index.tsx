import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import * as styles from "@paperclip-ui/designer/src/styles/left-sidebar.pc";
import * as sidebarStyles from "@paperclip-ui/designer/src/styles/sidebar.pc";
import { useDispatch, useSelector } from "@paperclip-ui/common";
import {
  DNDKind,
  DesignerState,
  getCurrentDependency,
  getCurrentFilePath,
  getExpandedVirtIds,
  getGraph,
  getSelectedId,
} from "@paperclip-ui/designer/src/state";
import {
  Component,
  DocumentBodyItem,
  Element,
  Insert,
  Node,
  Slot,
  TextNode,
} from "@paperclip-ui/proto/lib/generated/ast/pc";
import { ast } from "@paperclip-ui/proto-ext/lib/ast/pc-utils";
import { DesignerEvent } from "@paperclip-ui/designer/src/events";
import cx from "classnames";
import { useHistory } from "@paperclip-ui/designer/src/domains/history/react";
import { routes } from "@paperclip-ui/designer/src/state/routes";
import { useDrag, useDrop } from "react-dnd";

export const LeftSidebar = () => {
  const { title, document, show, onBackClick } = useLeftSidebar();

  if (!document || !show) {
    return null;
  }

  return (
    <styles.LeftSidebar>
      <sidebarStyles.SidebarPanel>
        <styles.LeftSidebarHeader title={title} onBackClick={onBackClick} />
        <sidebarStyles.SidebarSection>
          <sidebarStyles.SidebarPanelHeader>
            Layers
          </sidebarStyles.SidebarPanelHeader>
        </sidebarStyles.SidebarSection>
        <styles.Layers>
          {document.body.map((item) => (
            <DocumentBodyItemLeaf
              key={ast.getDocumentBodyInner(item).id}
              depth={1}
              expr={item}
            />
          ))}
        </styles.Layers>
      </sidebarStyles.SidebarPanel>
    </styles.LeftSidebar>
  );
};

type LeafProps<Expr> = {
  expr: Expr;
  depth: number;
  instanceOf?: string[];
};

const DocumentBodyItemLeaf = memo(
  ({ expr: item, depth }: LeafProps<DocumentBodyItem>) => {
    if (item.component) {
      return <ComponentLeaf expr={item.component} depth={depth} />;
    }
    if (item.element) {
      return <ElementLeaf expr={item.element} depth={depth} />;
    }
    if (item.text) {
      return <ElementLeaf expr={item.text} depth={depth} />;
    }

    return null;
  }
);

const ComponentLeaf = memo(
  ({ expr: component, depth, instanceOf }: LeafProps<Component>) => {
    const render = ast.getComponentRenderExpr(component);
    return (
      <Leaf
        id={component.id}
        className={cx("component", { container: component.body.length > 0 })}
        text={component.name}
        depth={depth}
        instanceOf={instanceOf}
      >
        {() => render && <NodeLeaf expr={render.node} depth={depth + 1} />}
      </Leaf>
    );
  }
);

const NodeLeaf = memo(({ expr: node, depth, instanceOf }: LeafProps<Node>) => {
  if (node.element) {
    return (
      <ElementLeaf expr={node.element} depth={depth} instanceOf={instanceOf} />
    );
  }
  if (node.text) {
    return <TextLeaf expr={node.text} depth={depth} instanceOf={instanceOf} />;
  }
  if (node.slot) {
    return <SlotLeaf expr={node.slot} depth={depth} instanceOf={instanceOf} />;
  }
  if (node.insert) {
    return (
      <InsertLeaf expr={node.insert} depth={depth} instanceOf={instanceOf} />
    );
  }
  return null;
});

const ElementLeaf = memo(
  ({ expr: element, depth, instanceOf }: LeafProps<Element>) => {
    const graph = useSelector(getGraph);
    const isInstance = ast.isInstance(element, graph);

    if (isInstance) {
      return (
        <InstanceLeaf expr={element} depth={depth} instanceOf={instanceOf} />
      );
    } else {
      return (
        <NativeElementLeaf
          expr={element}
          depth={depth}
          instanceOf={instanceOf}
        />
      );
    }
  }
);

const InstanceLeaf = ({
  expr: element,
  depth,
  instanceOf,
}: LeafProps<Element>) => {
  const graph = useSelector(getGraph);
  const component = ast.getInstanceComponent(element, graph);
  const render = ast.getComponentRenderExpr(component);
  const [shadowVisible, setShadowVisible] = useState(false);
  const onShadowIconClick = () => setShadowVisible(!shadowVisible);
  const expandedVirtIds = useSelector(getExpandedVirtIds);
  const shouldExpandShadow = expandedVirtIds.some((virtId) =>
    virtId.includes(element.id)
  );

  useEffect(() => {
    if (shouldExpandShadow) {
      setShadowVisible(shouldExpandShadow);
    }
  }, [shouldExpandShadow]);

  return (
    <Leaf
      id={element.id}
      className={cx("instance", {
        container: shadowVisible || element.body.length > 0,
      })}
      text={<>{element.name || element.tagName}</>}
      depth={depth}
      instanceOf={instanceOf}
      controls={
        <>
          <styles.Tooltip>
            <styles.ShadowIcon
              class={cx({ visible: shadowVisible })}
              onClick={onShadowIconClick}
            />
          </styles.Tooltip>
        </>
      }
    >
      {() => {
        return (
          <>
            {shadowVisible && render && (
              <NodeLeaf
                expr={render.node}
                depth={depth + 1}
                instanceOf={[...(instanceOf || []), element.id]}
              />
            )}
            {element.body.map((child) => (
              <NodeLeaf
                key={ast.getNodeInner(child).id}
                expr={child}
                depth={depth + 1}
                instanceOf={instanceOf}
              />
            ))}
          </>
        );
      }}
    </Leaf>
  );
};

const NativeElementLeaf = ({
  expr: element,
  depth,
  instanceOf,
}: LeafProps<Element>) => {
  return (
    <Leaf
      id={element.id}
      className={cx("element", { container: element.body.length > 0 })}
      text={<>{element.name || element.tagName}</>}
      depth={depth}
      instanceOf={instanceOf}
    >
      {() =>
        element.body.map((child) => (
          <NodeLeaf
            key={ast.getNodeInner(child).id}
            expr={child}
            depth={depth + 1}
            instanceOf={instanceOf}
          />
        ))
      }
    </Leaf>
  );
};

const TextLeaf = memo(
  ({ expr: text, depth, instanceOf }: LeafProps<TextNode>) => {
    return (
      <Leaf
        id={text.id}
        className="text"
        text={text.value}
        depth={depth}
        instanceOf={instanceOf}
      />
    );
  }
);

const SlotLeaf = memo(({ expr: slot, depth, instanceOf }: LeafProps<Slot>) => {
  return (
    <Leaf
      id={slot.id}
      className={cx("slot", { container: slot.body.length > 0 })}
      text={slot.name}
      depth={depth}
      instanceOf={instanceOf}
    >
      {() =>
        slot.body.map((child) => (
          <NodeLeaf
            key={ast.getInnerExpression(child).id}
            expr={child}
            depth={depth + 1}
          />
        ))
      }
    </Leaf>
  );
});

const InsertLeaf = memo(
  ({ expr: insert, depth, instanceOf }: LeafProps<Insert>) => {
    return (
      <Leaf
        id={insert.id}
        className={cx("slot", { container: insert.body.length > 0 })}
        text={insert.name}
        depth={depth}
        instanceOf={instanceOf}
      >
        {() => (
          <>
            {insert.body.map((child) => (
              <NodeLeaf
                key={ast.getInnerExpression(child).id}
                expr={child}
                depth={depth + 1}
                instanceOf={instanceOf}
              />
            ))}
          </>
        )}
      </Leaf>
    );
  }
);

const Leaf = ({
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
      {open && children && children()}
    </styles.TreeNavigationItem>
  );
};

const useLeftSidebar = () => {
  const currentFile = useSelector(getCurrentFilePath);
  const dependency = useSelector(getCurrentDependency);
  const show = useSelector((state: DesignerState) => state.showLeftSidebar);
  const history = useHistory();
  const onBackClick = () => {
    history.redirect(routes.dashboard());
  };

  return {
    show,
    onBackClick,
    title: currentFile.split("/").pop(),
    document: dependency?.document,
  };
};

const BORDER_MARGIN = 4;

type DropHotSpot = "inside" | "before" | "after";

const useLeaf = ({
  exprId,
  instanceOf,
}: {
  exprId: string;
  instanceOf: string[];
}) => {
  const virtId = [...(instanceOf || []), exprId].join(".");
  const open = useSelector(getExpandedVirtIds).includes(virtId);
  const selected = useSelector(getSelectedId) === virtId;
  const headerRef = useRef<HTMLDivElement>(null);
  const [dropHotSpot, setDropHotSpot] = useState<DropHotSpot>(null);
  const graph = useSelector(getGraph);

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
          const isTop = offset.y < rect.top + BORDER_MARGIN;
          const isBottom = offset.y > rect.bottom - BORDER_MARGIN;

          setDropHotSpot(isTop ? "before" : isBottom ? "after" : "inside");
        } else {
          setDropHotSpot(null);
        }
      },
      drop(item: any, monitor) {
        dispatch({
          type: "editor/exprNavigatorDroppedNode",
          payload: {
            position: dropHotSpot,
            targetId: exprId,
            droppedExprId: item.id,
          },
        });
      },
      canDrop({ id: draggedExprId }, monitor) {
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
    [graph]
  );

  useEffect(() => {
    if (!isDraggingOver) {
      setDropHotSpot(null);
    }
  }, [isDraggingOver]);

  const dispatch = useDispatch<DesignerEvent>();
  const onClick = useCallback(() => {
    dispatch({ type: "editor/layerLeafClicked", payload: { virtId } });
  }, [virtId]);

  const onArrowClick = useCallback(
    (event: React.MouseEvent<any>) => {
      event.stopPropagation();
      dispatch({ type: "editor/layerArrowClicked", payload: { virtId } });
    },
    [virtId]
  );

  return {
    onClick,
    onArrowClick,
    dropHotSpot,
    headerRef,
    dragRef,
    dropRef,
    style: { opacity },
    open,
    selected,
  };
};
