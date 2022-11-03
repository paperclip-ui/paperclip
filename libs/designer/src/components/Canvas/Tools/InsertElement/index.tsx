import { useSelector } from "@paperclip-ui/common";
import { getCanvas } from "@paperclip-ui/designer/src/machine/state";
import { Point } from "@paperclip-ui/designer/src/machine/state/geom";
import React, { useEffect, useMemo } from "react";

export type InsertElementProps = {
  startPosition: Point;
  endPosition: Point;
};

export const InsertElement = () => {
  const { mouseDown, mousePosition, transform } = useSelector(getCanvas);

  const start = useMemo(() => {
    return {
      left: mousePosition.x,
      top: mousePosition.y,
    };
  }, [mouseDown]);

  const end = {
    left: mousePosition.x,
    top: mousePosition.y,
  };

  const style = {
    width: Math.abs(start.left - end.left),
    height: Math.abs(start.top - end.top),
    left: 0,
    top: 0,
    position: "absolute",
    background: "#CCC",
    transform: `translateX(${Math.min(
      start.left,
      end.left
    )}px) translateY(${Math.min(start.top, end.top)}px) translateZ(0)`,
  };

  if (!mouseDown) {
    return null;
  }

  return <div style={style as any}></div>;
};
