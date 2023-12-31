import React, { memo } from "react";
import * as styles from "../ui.pc";
import { useSelector } from "@paperclip-ui/common";
import {
  getCurrentDependency,
  getCurrentFilePath,
  getGraph,
} from "@paperclip-ui/designer/src/state";
import {
  Component,
  DocumentBodyItem,
  Element,
  Insert,
  Node,
  Condition,
  Render,
  Slot,
  Style,
  TextNode,
  Trigger,
} from "@paperclip-ui/proto/lib/generated/ast/pc";
import { ast } from "@paperclip-ui/core/lib/src/proto/ast/pc-utils";
import cx from "classnames";
import { Atom } from "@paperclip-ui/proto/lib/generated/ast/pc";
import { Leaf } from "./Leaf";
import { BaseLayersProps } from "../ui.pc";

export const Layers = (Base: React.FC<BaseLayersProps>) =>
  function Layers() {
    const { document, title } = useLayers();

    if (!document) {
      return null;
    }

    return (
      <Base
        sidebar={{}}
        title={title}
        entities={{}}
        entitiesHeader={{}}
        header={{}}
        layers={document.body.map((item) => (
          <DocumentBodyItemLeaf
            key={ast.getDocumentBodyInner(item).id}
            depth={1}
            expr={item}
          />
        ))}
      />
    );
  };

const useLayers = () => {
  const currentFile = useSelector(getCurrentFilePath);
  const dependency = useSelector(getCurrentDependency);

  return {
    title: currentFile && currentFile.split("/").pop(),
    document: dependency?.document,
  };
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
      return <TextLeaf expr={item.text} depth={depth} />;
    }
    if (item.trigger) {
      return <TriggerLeaf expr={item.trigger} depth={depth} />;
    }

    if (item.atom) {
      return <AtomLeaf expr={item.atom} depth={depth} />;
    }
    if (item.style) {
      return <StyleMixinLeaf expr={item.style} depth={depth} />;
    }

    return null;
  }
);

const ComponentLeaf = memo(
  ({ expr: component, depth, instanceOf }: LeafProps<Component>) => {
    const render = ast.getComponentRenderExpr(component);

    const renderNode =
      render?.node && (ast.getNodeInner(render.node) as ast.InnerNode);

    return (
      <Leaf
        id={component.id}
        className={cx("component", { container: renderNode?.body?.length > 0 })}
        text={<>{component.name}</>}
        altText={
          <styles.TagType>
            {render?.node.element
              ? render?.node.element.tagName
              : render?.node.text
              ? "text"
              : undefined}
          </styles.TagType>
        }
        depth={depth}
        instanceOf={instanceOf}
      >
        {() => {
          return <RenderNodeLeaf expr={render} depth={depth + 1} />;
        }}
      </Leaf>
    );
  }
);

const RenderNodeLeaf = memo(
  ({ expr: render, depth, instanceOf }: LeafProps<Render>) => {
    const renderNode =
      render?.node && (ast.getNodeInner(render.node) as ast.InnerNode);

    return (
      <>
        {renderNode?.body?.map((child) => (
          <NodeLeaf
            key={ast.getNodeInner(child).id}
            expr={child}
            depth={depth}
            instanceOf={instanceOf}
          />
        ))}
      </>
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
  if (node.condition) {
    return (
      <ConditionLeaf
        expr={node.condition}
        depth={depth}
        instanceOf={instanceOf}
      />
    );
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
  expr: instance,
  depth,
  instanceOf,
}: LeafProps<Element>) => {
  const graph = useSelector(getGraph);
  const component = ast.getInstanceComponent(instance, graph);

  return (
    <Leaf
      id={instance.id}
      className={cx("instance", {
        container: instance.body.length > 0,
      })}
      text={<>{instance.name || "Instance"}</>}
      altText={<styles.TagType>{instance.tagName}</styles.TagType>}
      depth={depth}
      instanceOf={instanceOf}
    >
      {() => {
        return (
          <>
            {instance.body.map((child) => (
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
      text={<>{element.name || "Element"} </>}
      altText={<styles.TagType>{element.tagName}</styles.TagType>}
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
const TriggerLeaf = memo(({ expr, depth, instanceOf }: LeafProps<Trigger>) => {
  return (
    <Leaf
      id={expr.id}
      className="trigger"
      text={expr.name}
      depth={depth}
      instanceOf={instanceOf}
    />
  );
});

const AtomLeaf = memo(({ expr, depth, instanceOf }: LeafProps<Atom>) => {
  return (
    <Leaf
      id={expr.id}
      className="atom-token"
      text={expr.name}
      depth={depth}
      instanceOf={instanceOf}
    />
  );
});
const StyleMixinLeaf = memo(({ expr, depth, instanceOf }: LeafProps<Style>) => {
  return (
    <Leaf
      id={expr.id}
      className="composite-token"
      text={expr.name}
      depth={depth}
      instanceOf={instanceOf}
    />
  );
});

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

const ConditionLeaf = memo(
  ({ expr, depth, instanceOf }: LeafProps<Condition>) => {
    return (
      <Leaf
        id={expr.id}
        className={cx("condition", { container: expr.body.length > 0 })}
        text={expr.property}
        depth={depth}
        instanceOf={instanceOf}
      >
        {() =>
          expr.body.map((child) => (
            <NodeLeaf
              key={ast.getInnerExpression(child).id}
              expr={child}
              depth={depth + 1}
            />
          ))
        }
      </Leaf>
    );
  }
);

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
