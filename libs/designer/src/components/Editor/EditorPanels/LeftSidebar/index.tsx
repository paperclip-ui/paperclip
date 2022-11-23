import React, { memo, useCallback } from "react";
import * as styles from "@paperclip-ui/designer/src/styles/left-sidebar.pc";
import * as commonStyles from "@paperclip-ui/designer/src/styles/common.pc";
import { useDispatch, useSelector } from "@paperclip-ui/common";
import { getHistoryState } from "@paperclip-ui/designer/src/machine/engine/history/state";
import {
  getCurrentDependency,
  getExpandedLayerIds,
  getGraph,
  getSelectedNodeIds,
} from "@paperclip-ui/designer/src/machine/state";
import {
  Component,
  DocumentBodyItem,
  Element,
  Node,
  Slot,
  TextNode,
} from "@paperclip-ui/proto/lib/generated/ast/pc";
import { ast } from "@paperclip-ui/proto/lib/ast/pc-utils";
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
      <commonStyles.SidebarSection>
        <commonStyles.SidebarPanelHeader>
          Layers
        </commonStyles.SidebarPanelHeader>
      </commonStyles.SidebarSection>
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
        className="component container"
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

  return (
    <Leaf
      id={element.id}
      className="instance container"
      text={<>{element.name || element.tagName}</>}
      depth={depth}
      instanceOf={instanceOf}
    >
      {() => {
        return (
          <>
            <NodeLeaf
              expr={render.node}
              depth={depth + 1}
              instanceOf={[element.id, ...(instanceOf || [])]}
            />
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
      className="element container"
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
      className="slot container"
      text={slot.name}
      depth={depth}
      instanceOf={instanceOf}
    />
  );
});

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
  const { selected, open, onClick } = useLeaf({ exprId: id });
  const shadow = instanceOf != null;
  return (
    <styles.TreeNavigationItem>
      <styles.LayerNavigationItemHeader
        class={cx(className, { open, selected, shadow })}
        style={{ "--depth": depth }}
        onClick={onClick}
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

const useLeaf = ({ exprId }: { exprId: string }) => {
  const open = useSelector(getExpandedLayerIds).includes(exprId);
  const selected = useSelector(getSelectedNodeIds).includes(exprId);
  const dispatch = useDispatch();
  const onClick = useCallback(() => {
    dispatch(editorEvents.layerLeafClicked({ exprId }));
  }, []);

  return {
    onClick,
    open,
    selected,
  };
};
