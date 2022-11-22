import React, { memo } from "react";
import * as styles from "@paperclip-ui/designer/src/styles/left-sidebar.pc";
import * as commonStyles from "@paperclip-ui/designer/src/styles/common.pc";
import { useSelector } from "@paperclip-ui/common";
import { getHistoryState } from "@paperclip-ui/designer/src/machine/engine/history/state";
import { getCurrentDependency } from "@paperclip-ui/designer/src/machine/state";
import {
  Component,
  DocumentBodyItem,
  Element,
  Node,
  Slot,
  TextNode,
} from "@paperclip-ui/proto/lib/generated/ast/pc";
import {
  getDocumentBodyInner,
  getNodeInner,
} from "@paperclip-ui/proto/lib/ast/pc-utils";

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
            key={getDocumentBodyInner(item).id}
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
};

type DocumentBodyItemProps = {
  item: DocumentBodyItem;
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
  ({ expr: component, depth }: LeafProps<Component>) => {
    const render = component.body.find((item) => item.render)?.render;
    return (
      <styles.TreeNavigationItem>
        <styles.LayerNavigationItemHeader
          class="component container"
          style={{ "--depth": depth }}
        >
          {component.name}
        </styles.LayerNavigationItemHeader>
        {render && <NodeLeaf expr={render.node} depth={depth + 1} />}
      </styles.TreeNavigationItem>
    );
  }
);

const NodeLeaf = memo(({ expr: node, depth }: LeafProps<Node>) => {
  if (node.element) {
    return <ElementLeaf expr={node.element} depth={depth} />;
  }
  if (node.text) {
    return <TextLeaf expr={node.text} depth={depth} />;
  }
  if (node.slot) {
    return <SlotLeaf expr={node.slot} depth={depth} />;
  }
  return null;
});

const ElementLeaf = memo(({ expr: element, depth }: LeafProps<Element>) => {
  return (
    <styles.TreeNavigationItem>
      <styles.LayerNavigationItemHeader
        class="element container"
        style={{ "--depth": depth }}
      >
        {element.name || "Untitled"}
        <styles.TagType>{element.tagName}</styles.TagType>
      </styles.LayerNavigationItemHeader>
      <styles.TreeNavigationItemContent>
        {element.body.map((child) => (
          <NodeLeaf
            key={getNodeInner(child).id}
            expr={child}
            depth={depth + 1}
          />
        ))}
      </styles.TreeNavigationItemContent>
    </styles.TreeNavigationItem>
  );
});

const TextLeaf = memo(({ expr: text, depth }: LeafProps<TextNode>) => {
  return (
    <styles.TreeNavigationItem>
      <styles.LayerNavigationItemHeader
        class="text"
        style={{ "--depth": depth }}
      >
        {text.value}
      </styles.LayerNavigationItemHeader>
    </styles.TreeNavigationItem>
  );
});

const SlotLeaf = memo(({ expr: slot, depth }: LeafProps<Slot>) => {
  return (
    <styles.TreeNavigationItem>
      <styles.LayerNavigationItemHeader
        class="slot container"
        style={{ "--depth": depth }}
      >
        {slot.name || "Untitled"}
      </styles.LayerNavigationItemHeader>
    </styles.TreeNavigationItem>
  );
});

const useLeftSidebar = () => {
  const history = useSelector(getHistoryState);
  const dependency = useSelector(getCurrentDependency);

  return {
    title: history.query.file.split("/").pop(),
    document: dependency?.document,
  };
};
