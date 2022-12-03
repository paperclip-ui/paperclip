import React, { memo, useCallback, useEffect, useState } from "react";
import * as styles from "@paperclip-ui/designer/src/styles/left-sidebar.pc";
import * as sidebarStyles from "@paperclip-ui/designer/src/styles/sidebar.pc";
import { useDispatch, useSelector } from "@paperclip-ui/common";
import { getHistoryState } from "@paperclip-ui/designer/src/machine/engine/history/state";
import {
  getCurrentDependency,
  getExpandedVirtIds,
  getGraph,
  getSelectedNodeIds,
} from "@paperclip-ui/designer/src/machine/state";
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
import { editorEvents } from "@paperclip-ui/designer/src/machine/events";
import cx from "classnames";

export const LeftSidebar = () => {
  const { title, document } = useLeftSidebar();

  if (!document) {
    return null;
  }

  return (
    <styles.LeftSidebar>
      <styles.LeftSidebarHeader title={title} />
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
    const render = ast.getComponentRenderNode(component);
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
  const render = ast.getComponentRenderNode(component);
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
  const { selected, open, onClick, onArrowClick } = useLeaf({
    exprId: id,
    instanceOf,
  });
  const shadow = instanceOf != null;
  return (
    <styles.TreeNavigationItem>
      <styles.LayerNavigationItemHeader
        class={cx(className, { open, selected, shadow })}
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
  const history = useSelector(getHistoryState);
  const dependency = useSelector(getCurrentDependency);

  return {
    title: history.query.file.split("/").pop(),
    document: dependency?.document,
  };
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
  const selected = useSelector(getSelectedNodeIds).includes(virtId);

  const dispatch = useDispatch();
  const onClick = useCallback(() => {
    dispatch(editorEvents.layerLeafClicked({ virtId }));
  }, [virtId]);

  const onArrowClick = useCallback(
    (event: React.MouseEvent<any>) => {
      event.stopPropagation();
      dispatch(editorEvents.layerArrowClicked({ virtId }));
    },
    [virtId]
  );

  return {
    onClick,
    onArrowClick,
    open,
    selected,
  };
};
