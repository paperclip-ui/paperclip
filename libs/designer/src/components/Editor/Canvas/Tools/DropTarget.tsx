import { useDispatch } from "@paperclip-ui/common";
import { designerEvents } from "@paperclip-ui/designer/src/events";
import React, { useEffect, useRef, useState } from "react";
import { useDrop } from "react-dnd";

type DropTargetProps = {
  children: any;
};

export const DropTarget = ({ children }: DropTargetProps) => {
  const [toolsRef, setToolsRef] = useState<HTMLDivElement>();
  const dispatch = useDispatch();

  const [{ isDraggingOver }, dragRef] = useDrop({
    accept: "component",
    hover: (item, monitor) => {
      const offset = monitor.getClientOffset();
      const rect = toolsRef.getBoundingClientRect();
      dispatch(
        designerEvents.toolsLayerDragOver({
          x: offset.x - rect.x,
          y: offset.y - rect.y,
        })
      );
    },
    drop(item, monitor) {
      dispatch(
        designerEvents.toolsLayerDrop({
          node: item,
          point: monitor.getSourceClientOffset(),
        })
      );
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
