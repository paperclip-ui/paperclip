import React, { useEffect, useRef, useState } from "react";
import * as ReactDOM from "react-dom";
import { Bounds, shiftBounds, shiftPoint, Point } from "tandem-common";
import { BasePopoverProps, ElementProps } from "./view.pc";

export type Props = {
  open: boolean;
  centered?: boolean;
  anchorRect?: Bounds;
  onShouldClose: any;
  updateContentPosition?: (point: Point, popoverRect: Bounds) => Point;
} & ElementProps;

type PopoverState = {
  anchorRect: Bounds;
};

export default (Base: React.ComponentClass<BasePopoverProps>) =>
  ({
    centered,
    open,
    onShouldClose,
    updateContentPosition,
    ...rest
  }: Props) => {
    const [anchorRect, setAnchorRect] = useState<Bounds>(null);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (ref.current && open) {
        const rect = getRealElementBounds(ref.current);
        setAnchorRect(rect);
      } else {
        setAnchorRect(null);
      }
    }, [open, ref.current]);

    let overrideProps: BasePopoverProps = {
      contentProps: {
        onShouldClose,
        anchorRect,
      },
    };

    if (anchorRect) {
      overrideProps = {
        contentProps: {
          updateContentPosition,
          onShouldClose,
          centered,
          anchorRect,
          style: {
            display: "block",
            position: "fixed",
          },
        },
      };
    }

    return <Base ref={ref} {...rest} {...overrideProps} />;
  };

const getRealElementBounds = (element: HTMLElement) => {
  const parentIframes = [];

  let current = element;
  while (1) {
    const ownerDocument = current.ownerDocument;
    if (ownerDocument === document) {
      break;
    }
    const iframe = Array.prototype.find.call(
      ownerDocument.defaultView.parent.document.querySelectorAll("iframe"),
      (iframe: HTMLIFrameElement) => {
        return iframe.contentDocument === ownerDocument;
      }
    );

    current = iframe;
    parentIframes.push(iframe);
  }

  const offset = parentIframes.reduce(
    (point, iframe) => shiftPoint(point, iframe.getBoundingClientRect()),
    { left: 0, top: 0 }
  );

  return shiftBounds(element.getBoundingClientRect(), offset);
};
