import { useDispatch } from "@paperclip-ui/common";
import {
  DesignerEvent,
  designerEvents,
} from "@paperclip-ui/designer/src/events";
import { DNDKind } from "@paperclip-ui/designer/src/state";
import React, { useEffect, useRef, useState } from "react";
import { useDrop } from "react-dnd";

type DropTargetProps = {
  children: any;
};

export const DropTarget = ({ children }: DropTargetProps) => {
  const { setToolsRef, isDraggingOver } = useDropTarget();

  return (
    <div
      ref={setToolsRef}
      style={{
        cursor: isDraggingOver ? "copy" : "initial",
      }}
    >
      {children}
    </div>
  );
};

const useDropTarget = () => {
  const [toolsRef, setToolsRef] = useState<HTMLDivElement>();
  const dispatch = useDispatch<DesignerEvent>();

  const [{ isDraggingOver }, dragRef] = useDrop({
    accept: DNDKind.Resource,
    hover: (item, monitor) => {
      const offset = monitor.getClientOffset();
      dispatch({
        type: "designer/ToolsLayerDragOver",
        payload: {
          x: offset.x,
          y: offset.y,
        },
      });
    },
    drop(item, monitor) {
      dispatch({
        type: "designer/ToolsLayerDrop",
        payload: {
          kind: DNDKind.Resource,
          item,
          point: monitor.getSourceClientOffset(),
        },
      });
    },
    collect(monitor) {
      return {
        isDraggingOver: monitor.isOver(),
      };
    },
  });

  useEffect(() => {
    dragRef(toolsRef);
  }, [toolsRef]);

  useEffect(() => {
    document.body.style.cursor = isDraggingOver ? "copy" : "initial";
  }, [isDraggingOver]);

  return { setToolsRef, isDraggingOver };
};
