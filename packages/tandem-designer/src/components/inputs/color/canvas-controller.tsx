import * as React from "react";
import { noop } from "lodash";
import { startDOMDrag, Point } from "tandem-common";
import { compose, pure, withHandlers, withState, lifecycle } from "recompose";
import { BasePickerProps } from "./picker.pc";

export enum GrabberAxis {
  X = 1,
  Y = X << 1,
}

export type Props = {
  grabberAxis: any;
  draw: any;
  onChange: any;
  onChangeComplete: any;
  getGraggerPoint: any;
  value: any;
};

type InnerProps = {
  canvas: HTMLCanvasElement;
  setCanvas: any;
  grabberPoint: Point;
  setGrabberPoint: any;
} & Props;

export default compose(
  pure,
  withState(`canvas`, `setCanvas`, null),
  withState(`grabberPoint`, `setGrabberPoint`, null),
  withHandlers(() => {
    let _canvas: HTMLCanvasElement;
    return {
      onCanvas:
        ({ setCanvas, draw = noop }: InnerProps) =>
        (canvas: HTMLCanvasElement) => {
          setCanvas((_canvas = canvas));
          if (canvas) {
            // need to set immediate to ensure that canvas is actually mounted
            setImmediate(() => {
              const { width, height } =
                canvas.parentElement.getBoundingClientRect();
              draw(canvas, width || 100, height || 100);
            });
          }
        },
      onMouseDown:
        ({
          grabberAxis,
          setGrabberPoint,
          onChange,
          onChangeComplete,
        }: InnerProps) =>
        (event) => {
          const rect = _canvas.getBoundingClientRect();

          const handleChange = (callback) => (event) => {
            const point = {
              left:
                grabberAxis & GrabberAxis.X
                  ? Math.max(
                      0,
                      Math.min(rect.width - 1, event.clientX - rect.left)
                    )
                  : 0,
              top:
                grabberAxis & GrabberAxis.Y
                  ? Math.max(
                      0,
                      Math.min(rect.height - 1, event.clientY - rect.top)
                    )
                  : 0,
            };
            if (callback) {
              const imageData = _canvas
                .getContext("2d")
                .getImageData(point.left, point.top, 1, 1).data;

              callback(imageData);
            }

            setGrabberPoint(point);
          };

          startDOMDrag(
            event,
            noop,
            handleChange(onChange),
            handleChange(onChangeComplete)
          );
        },
    };
  }),
  lifecycle({
    componentDidUpdate({
      setGrabberPoint,
      getGraggerPoint,
      draw,
      canvas,
      value,
    }: InnerProps) {
      if (canvas && this.props.draw !== draw && this.props.draw) {
        setImmediate(() => {
          const { width, height } =
            canvas.parentElement.getBoundingClientRect();
          this.props.draw(canvas, width, height);
        });
      }

      if (canvas && this.props.value !== value) {
        setImmediate(() => {
          const { width, height } =
            canvas.parentElement.getBoundingClientRect();
          setGrabberPoint(getGraggerPoint(this.props.value, width, height));
        });
      }
    },
  }),
  (Base: React.ComponentClass<BasePickerProps>) =>
    ({
      onMouseDown,
      onCanvas,
      grabberAxis,
      draw,
      onChange,
      onChangeComplete,
      canvas,
      grabberPoint,
      ...rest
    }) => {
      return (
        <Base
          {...rest}
          grabberProps={{
            style: grabberPoint,
          }}
          onMouseDown={onMouseDown}
          canvasProps={{
            ref: onCanvas,
          }}
        />
      );
    }
);
