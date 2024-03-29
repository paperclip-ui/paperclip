import React, { useEffect, useState } from "react";
import * as styles from "./index.pc";
import { isEqual } from "lodash";
import {
  Box,
  Point,
  roundBox,
  Transform,
} from "@paperclip-ui/designer/src/state/geom";
import { useDispatch } from "@paperclip-ui/common";
import { startDOMDrag } from "@paperclip-ui/designer/src/ui/logic/utils/dnd";
import { DesignerEvent } from "@paperclip-ui/designer/src/events";

type Props = {
  canvasScroll: Point;
  box: Box;
  canvasTransform: Transform;
  showKnobs?: boolean;
  cursor?: string;
};

const KNOB_CLASS_MAP = {
  "0-0": "top-left",
  "100-0": "top-right",
  "0-100": "bottom-left",
  "100-100": "bottom-right",
};

// https://github.com/crcn/tandem/blob/10.0.0/packages/dashboard/src/components/root/workspace/editors/paperclip/stage/canvas/tools-layer/selection/resizer.tsx

export const Selectable = React.memo(
  ({ box, canvasTransform, canvasScroll, showKnobs, cursor }: Props) => {
    const [currentBox, setCurrentBox] = useState(box);
    const [initialBox, setInitialBox] = useState(box);
    const dispatch = useDispatch();

    useEffect(() => {
      if (!isEqual(initialBox, box)) {
        setCurrentBox(box);
        setInitialBox(box);
      }
    }, [box]);

    if (!currentBox) {
      return null;
    }

    const left =
      (currentBox.x - canvasScroll.x) * canvasTransform.z + canvasTransform.x;
    const top =
      (currentBox.y - canvasScroll.y) * canvasTransform.z + canvasTransform.y;

    let knobs: Point[] | null = null;
    let edges: Record<string, Point> | null = null;

    if (showKnobs && currentBox) {
      knobs = [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 100 },
        { x: 0, y: 100 },
      ];
      edges = {
        left: { x: 0, y: 50 },
        top: { x: 50, y: 0 },
        right: { x: 100, y: 50 },
        bottom: { x: 50, y: 100 },
      };
    }

    const onKnobMouseDown = (event: React.MouseEvent<any>, point: Point) => {
      event.stopPropagation();
      const bounds = currentBox;
      const zoom = canvasTransform.z;

      // need to keep track of this internal state since it doesn't get
      // refreshed outside of this function because DND handlers here.
      let _currentBox = currentBox;

      const wrapActionCreator =
        (createAction: (payload) => DesignerEvent) => (event, info) => {
          const delta = {
            x: info.delta.x / zoom,
            y: info.delta.y / zoom,
          };

          // prevent parent containers from event like mouse click
          // which would deselect multi-selected elements
          event.stopPropagation();

          let x = point.x === 0 ? bounds.x + delta.x : bounds.x;
          let y = point.y === 0 ? bounds.y + delta.y : bounds.y;

          // make sure sizes don't go into negative values
          const width = Math.max(
            1,
            point.x === 100
              ? bounds.width + delta.x
              : point.x == 50
              ? bounds.width
              : bounds.width - delta.x
          );

          const height = Math.max(
            1,
            point.y === 100
              ? bounds.height + delta.y
              : point.y === 50
              ? bounds.height
              : bounds.height - delta.y
          );

          // if params don't change, then make sure that the box doesn't move
          if (width == _currentBox.width) {
            x = _currentBox.x;
          }

          if (height == _currentBox.height) {
            y = _currentBox.y;
          }

          const newBounds = (_currentBox = roundBox({
            x,
            y,
            width,
            height,
          }));

          setCurrentBox(newBounds);

          dispatch(
            createAction({
              originalBounds: roundBox(bounds),
              newBounds,
              anchor: point,
              sourceEvent: event,
            })
          );
        };

      startDOMDrag(
        event,
        null,
        wrapActionCreator((payload) => ({
          type: "ui/resizerPathMoved",
          payload,
        })),
        wrapActionCreator((payload) => ({
          type: "ui/resizerPathStoppedMoving",
          payload,
        }))
      );
    };

    const onMouseDown = (event) => {
      if (knobs) {
        const bounds = currentBox;
        const zoom = canvasTransform.z;

        const wrapActionCreator = (createAction) => (event, info) => {
          const delta = {
            x: info.delta.x / zoom,
            y: info.delta.y / zoom,
          };
          event.stopPropagation();
          const newBounds = roundBox({
            ...bounds,
            x: bounds.x + delta.x,
            y: bounds.y + delta.y,
          });
          setCurrentBox(newBounds);
          dispatch(
            createAction({
              originalBounds: roundBox(bounds),
              newBounds,
              sourceEvent: event,
            })
          );
        };

        startDOMDrag(
          event,
          null,
          wrapActionCreator((payload) => ({
            type: "ui/resizerPathMoved",
            payload,
          })),
          wrapActionCreator((payload) => ({
            type: "ui/resizerPathStoppedMoving",
            payload,
          }))
        );
      }
    };

    return (
      <>
        <styles.Overlay
          onClick={null}
          onMouseDown={onMouseDown}
          size={`${Math.round(currentBox.width)} x ${Math.round(
            currentBox.height
          )}`}
          edges={
            edges && (
              <>
                {Object.keys(edges).map((edge) => (
                  <styles.Edge
                    key={edge}
                    class={edge}
                    onMouseDown={(event) => {
                      onKnobMouseDown(event, edges[edge]);
                    }}
                  />
                ))}
              </>
            )
          }
          knobs={
            knobs && (
              <>
                {knobs.map(({ x, y }) => {
                  const key = `${x}-${y}`;
                  return (
                    <styles.Knob
                      onMouseDown={(event) => {
                        onKnobMouseDown(event, { x, y });
                      }}
                      key={key}
                      class={KNOB_CLASS_MAP[key]}
                      style={{ "--x": x, "--y": y }}
                    />
                  );
                })}
              </>
            )
          }
          style={{
            "--zoom": 1,
            transform: `translateX(${left}px) translateY(${top}px)`,
            width: currentBox.width * canvasTransform.z,
            height: currentBox.height * canvasTransform.z,
            transformOrigin: `top left`,
            cursor,
          }}
        />
      </>
    );
  }
);
