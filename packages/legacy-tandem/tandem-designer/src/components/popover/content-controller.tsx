import * as React from "react";
import { compose, pure, withState } from "recompose";
import { portal } from "../portal/controller";
import { Bounds, mergeBounds, getBoundsSize, Point } from "tandem-common";
import { BaseContentProps } from "./view.pc";

const calcPortalPosition = (
  centered: boolean,
  anchorRect: Bounds,
  portalRect: Bounds
) => {
  const portalSize = getBoundsSize(portalRect);
  const anchorSize = getBoundsSize(anchorRect);
  return {
    left: Math.min(
      anchorRect.left +
        (centered ? (anchorRect.right - anchorRect.left) / 2 : 0),
      window.innerWidth - portalSize.width
    ),
    top: Math.min(
      anchorRect.top + anchorSize.height,
      window.innerHeight - portalSize.height
    ),
  };
};

// ick, but okay for now. Will need to change
// when tests are added
let _popoverCount = 0;

export type Props = {
  onShouldClose: any;
  centered?: boolean;
  anchorRect: Bounds;
  children?: any;
  updateContentPosition?: (position: Point, rect: Bounds) => Point;
} & BaseContentProps;

export default compose<any, Props>(
  (Base: React.ComponentClass<any>) => {
    return class extends React.Component<any, any> {
      private _emptySpaceListener: any;
      private _scrollListener: any;
      private _popoverIndex: number;
      setContainer = (container: HTMLDivElement) => {
        const { onShouldClose } = this.props;
        if (this._emptySpaceListener) {
          if (this._popoverIndex) {
            _popoverCount--;
          }
          document.body.removeEventListener(
            "mousedown",
            this._emptySpaceListener
          );
          document.removeEventListener("scroll", this._scrollListener, true);
          this._emptySpaceListener = null;
        }
        if (container && onShouldClose) {
          // note that we keep track of how many popovers there are currently in the root in case any pop over
          // opens a separate popover -- in this case the user will need to click multiple times in order to close
          // all popovers
          this._popoverIndex = ++_popoverCount;
          document.body.addEventListener(
            "mousedown",
            (this._emptySpaceListener = (event) => {
              if (
                !container.contains(event.target) &&
                _popoverCount === this._popoverIndex
              ) {
                // beat onClick handler for dropdown button
                setTimeout(() => {
                  onShouldClose(event);
                });
              }
            })
          );

          document.addEventListener(
            "scroll",
            (this._scrollListener = (event) => {
              if (!container.contains(event.target)) {
                onShouldClose(event);
              }
            }),
            true
          );
        }
      };
      render() {
        const { anchorRect, children, setContainer, ...rest } = this.props;
        return anchorRect ? (
          <Base anchorRect={anchorRect} {...rest}>
            <div
              ref={this.setContainer}
              style={{ width: anchorRect.right - anchorRect.left }}
            >
              {children}
            </div>
          </Base>
        ) : null;
      }
    };
  },
  pure,
  withState(`style`, `setStyle`, null),
  portal({
    didMount:
      ({ centered, anchorRect, setStyle, updateContentPosition }) =>
      (portalMount) => {
        if (
          !portalMount ||
          !portalMount.children[0] ||
          !portalMount.children[0].children[0]
        ) {
          return;
        }
        const popoverRect = calcInnerBounds(
          portalMount.children[0].children[0].children[0] as HTMLElement
        );

        let position = calcPortalPosition(centered, anchorRect, popoverRect);

        if (updateContentPosition) {
          position = updateContentPosition(position, popoverRect);
        }
        const newStyle = {
          position: "absolute",
          zIndex: 1024,
          ...position,
        };
        setStyle(newStyle);
      },
  })
);

const calcInnerBounds = (
  element: HTMLElement,
  maxDepth: number = 0,
  depth: number = 0
): Bounds => {
  const rect: ClientRect = element.getBoundingClientRect();
  if (depth >= maxDepth) return rect;
  return mergeBounds(
    ...Array.from(element.children).reduce(
      (rects, child: HTMLElement) => {
        return [...rects, calcInnerBounds(child)];
      },
      [rect]
    )
  );
};
