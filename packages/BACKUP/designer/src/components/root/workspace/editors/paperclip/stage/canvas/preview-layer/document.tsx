import React, {
  Fragment,
  memo,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  Frame,
  Dependency,
  SyntheticVisibleNode,
  renderDOM,
  diffTreeNode,
  patchTreeNode,
  patchDOM,
  SyntheticNativeNodeMap,
  pcFrameRendered,
  computeDisplayInfo,
} from "paperclip";
import { useDispatch } from "react-redux";
import { Isolate } from "tandem-designer/src/components/isolated";

export type DocumentPreviewOuterProps = {
  frame: Frame;
  contentNode: SyntheticVisibleNode;
};

type DesignPreviewOuterProps = {
  contentNode: SyntheticVisibleNode;
  // dependency: Dependency<any>;
};

const DesignPreview = memo(({ contentNode }: DesignPreviewOuterProps) => {
  const container = useRef<HTMLDivElement>();
  const [currentContentNode, setCurrentContentNode] =
    useState<SyntheticVisibleNode>(contentNode);
  const [map, setNodeMap] = useState<SyntheticNativeNodeMap>();
  const dispatch = useDispatch();
  useLayoutEffect(() => {
    if (!container.current) {
      return;
    }

    let newMap: SyntheticNativeNodeMap;

    if (currentContentNode === contentNode) {
      newMap = renderDOM(container.current, contentNode);
    } else {
      const ots = diffTreeNode(currentContentNode, contentNode);
      newMap = patchDOM(ots, currentContentNode, container.current, map);
    }

    setNodeMap(newMap);

    dispatch(pcFrameRendered(contentNode.id, computeDisplayInfo(newMap)));
    setCurrentContentNode(contentNode);
  }, [container.current, currentContentNode, contentNode]);

  return <div ref={container} />;
});

export const DocumentPreviewComponent = memo(
  ({ contentNode, frame }: DocumentPreviewOuterProps) => {
    if (!contentNode) {
      return null;
    }

    const bounds = frame.bounds;
    if (!bounds) {
      return null;
    }

    const style = {
      position: "absolute",
      left: bounds.left,
      top: bounds.top,
      width: bounds.right - bounds.left,
      height: bounds.bottom - bounds.top,
      background: "white",
    } as any;

    return (
      <Isolate style={style}>
        <DesignPreview contentNode={contentNode} />
      </Isolate>
    );
  }
);
