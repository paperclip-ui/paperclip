import { useDispatch } from "@paperclip-ui/common";
import { DesignerEvent } from "@paperclip-ui/designer/src/events";
import { DNDKind } from "@paperclip-ui/designer/src/state";
import React, { useEffect, useRef, useState } from "react";
import { useDrop } from "react-dnd";
import { NativeTypes } from "react-dnd-html5-backend";

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
    accept: [DNDKind.Resource, NativeTypes.FILE, DNDKind.File],
    hover: (item, monitor) => {
      const offset = monitor.getClientOffset();

      // might not happen with file
      if (offset) {
        dispatch({
          type: "ui/toolsLayerDragOver",
          payload: {
            x: offset.x,
            y: offset.y,
          },
        });
      }
    },
    drop(item, monitor) {
      dispatch({
        type: "ui/toolsLayerDrop",
        payload: {
          kind: monitor.getItemType() as any,
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
