import { useDispatch, useSelector } from "@paperclip-ui/common";
import { getInsertBox } from "@paperclip-ui/designer/src/state";
import { Box, Point } from "@paperclip-ui/designer/src/state/geom";
import React, { useEffect, useMemo } from "react";

export type InsertElementProps = {
  startPosition: Point;
  endPosition: Point;
};

export const InsertElement = () => {
  const box = useSelector(getInsertBox);

  if (!box) {
    return null;
  }
  const style = {
    width: box.width,
    height: box.height,
    left: 0,
    top: 0,
    position: "absolute",
    background: "#CCC",
    transform: `translateX(${box.x}px) translateY(${box.y}px) translateZ(0)`,
  };

  return <div style={style as any}></div>;
};
