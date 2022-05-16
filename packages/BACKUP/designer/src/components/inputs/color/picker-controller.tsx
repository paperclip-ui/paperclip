import * as React from "react";
import cx from "classnames";
import { pure, compose, lifecycle, withState, withHandlers } from "recompose";
import { memoize, EMPTY_ARRAY } from "tandem-common";
import { GrabberAxis } from "./canvas-controller";
import { throttle, identity } from "lodash";
import { BasePickerProps, BaseColorPickerProps } from "./picker.pc";
import {
  ColorSwatchOption,
  maybeConvertSwatchValueToColor,
  ColorSwatchGroup,
} from "./color-swatch-controller";

const CHANGE_THROTTLE_MS = 1000 / 20;

type RGBA = [number, number, number, number];
type HSLA = [number, number, number, number];

export type Props = {
  value: string;
  onChange?: any;
  onChangeComplete?: any;
  swatchOptionGroups: ColorSwatchGroup[];
};

type InnerProps = {
  hsla: any;
  setHSLA: any;
  selectedSwatchGroupIndex: number;
  onColorSwatchChange: any;
  onRGBAInputChange: any;
  onRGBAInputChangeComplete: any;
  onHSLChange: any;
  onHSLChangeComplete: any;
  onSpectrumChange: any;
  onSpectrumChangeComplete: any;
  onOpacityChange: any;
  onOpacityChangeComplete: any;
} & Props;

export default compose(
  pure,
  withState(
    `hsla`,
    `setHSLA`,
    ({ value = "#000", swatchOptionGroups = EMPTY_ARRAY }: Props) => {
      value = maybeConvertSwatchValueToColor(value, swatchOptionGroups);
      const rgba = parseRGBA(value);
      return rgbaToHsla(rgba);
    }
  ),
  lifecycle({
    componentWillUpdate(props: InnerProps) {
      if (this.props.value !== props.value) {
        const rgba = parseRGBA(
          maybeConvertSwatchValueToColor(props.value, props.swatchOptionGroups)
        );
        const hsla = rgbaToHsla(rgba);
        if (hsla.join("") !== props.hsla.join("")) {
          this.props.setHSLA(hsla);
        }
      }
    },
  }),
  withHandlers(() => {
    const colorChangeCallback =
      (updater) =>
      ({ onChange, hsla, setHSLA }: InnerProps) =>
        throttle((rgba) => {
          setHSLA((hsla = updater(rgba, hsla)));
          if (onChange) {
            onChange(stringifyRgba(hslaToRgba(hsla)));
          }
        }, CHANGE_THROTTLE_MS);

    const colorChangeCompleteCallback =
      (updater) =>
      ({ onChangeComplete, hsla, setHSLA }) =>
      (rgba) => {
        setHSLA((hsla = updater(rgba, hsla)));
        if (onChangeComplete) {
          setTimeout(
            onChangeComplete,
            CHANGE_THROTTLE_MS * 2,
            stringifyRgba(hslaToRgba(hsla))
          );
        }
      };

    return {
      onHSLChange: colorChangeCallback(updateHSLA),
      onHSLChangeComplete: colorChangeCompleteCallback(updateHSLA),
      onSpectrumChange: colorChangeCallback(updateHue),
      onSpectrumChangeComplete: colorChangeCompleteCallback(updateHue),
      onOpacityChange: colorChangeCallback(updateOpacity),
      onOpacityChangeComplete: colorChangeCompleteCallback(updateOpacity),
      onRGBAInputChange: colorChangeCallback(rgbaToHsla),
      onRGBAInputChangeComplete: colorChangeCompleteCallback(rgbaToHsla),
      onColorSwatchChange:
        ({ onChange, onChangeComplete }) =>
        (value) => {
          if (onChange) {
            onChange(value);
          }

          if (onChangeComplete) {
            onChangeComplete(value);
          }
        },
    };
  }),
  (Base: React.ComponentClass<BaseColorPickerProps>) =>
    ({
      value,
      hsla,
      onChange,
      onChangeComplete,
      onRGBAInputChange,
      onRGBAInputChangeComplete,
      onColorSwatchChange,
      onHSLChange,
      onHSLChangeComplete,
      onSpectrumChange,
      onSpectrumChangeComplete,
      swatchOptionGroups = EMPTY_ARRAY,
      onOpacityChange,
      onOpacityChangeComplete,
      ...rest
    }: InnerProps) => {
      const rgba = hslaToRgba(hsla);
      return (
        <Base
          {...rest}
          variant={cx({
            noSwatches: swatchOptionGroups.length === 0,
          })}
          hslProps={{
            draw: hslDrawer(hsla[0]),
            value: hsla,
            onChange: onHSLChange,
            getGraggerPoint: hslPointer,
            onChangeComplete: onHSLChangeComplete,
            grabberAxis: GrabberAxis.X | GrabberAxis.Y,
          }}
          spectrumProps={{
            draw: hueDrawer,
            value: hsla,
            onChange: onSpectrumChange,
            getGraggerPoint: huePointer,
            onChangeComplete: onSpectrumChangeComplete,
            grabberAxis: GrabberAxis.X,
          }}
          opacityProps={{
            draw: opacityDrawer(hsla[0]),
            value: hsla,
            onChange: onOpacityChange,
            getGraggerPoint: opacityPointer,
            onChangeComplete: onOpacityChangeComplete,
            grabberAxis: GrabberAxis.X,
          }}
          colorSwatchesProps={{
            onChange: onColorSwatchChange,
            optionGroups: swatchOptionGroups,
            value,
          }}
          rgbaInputProps={{
            value: rgba,
            onChange: onRGBAInputChange,
            onChangeComplete: onRGBAInputChangeComplete,
          }}
        />
      );
    }
);

const stringifyRgba = ([r, g, b, a]: RGBA) => `rgba(${r}, ${g}, ${b}, ${a})`;

const hslDrawer = memoize(
  (h: number) =>
    (canvas: HTMLCanvasElement, width: number = 100, height: number = 100) => {
      const hv = h * 360;
      const ctx = canvas.getContext("2d");
      canvas.width = width;
      canvas.height = height;

      for (let row = 0; row <= height; row++) {
        let grad = ctx.createLinearGradient(0, 0, width, 0);
        grad.addColorStop(
          1,
          `hsl(${hv}, 0%, ${((height - row) / height) * 100}%)`
        );
        grad.addColorStop(
          0,
          `hsl(${hv}, 100%, ${((height - row) / height) * 50}%)`
        );
        ctx.fillStyle = grad;
        ctx.fillRect(0, row, width, 1);
      }
    }
);

const hslPointer = (hsl: HSLA, width: number, height: number) => {
  const [h, s, v] = hslToHsv(hsl);
  return {
    left: width * (1 - s),
    top: height * (1 - v),
  };
};

const opacityPointer = ([h, s, l, a]: HSLA, width: number, height: number) => {
  return {
    left: width * a,
  };
};

const huePointer = ([h]: HSLA, width: number, height: number) => {
  return {
    left: (width * (h * 360)) / 360,
  };
};

const hueDrawer = (
  canvas: HTMLCanvasElement,
  width: number,
  height: number
) => {
  const ctx = canvas.getContext("2d");
  canvas.width = width;
  canvas.height = height;

  for (let row = 0; row <= width; row++) {
    ctx.fillStyle = `hsl(${((row - width) / width) * 360}, 100%, 50%)`;
    ctx.fillRect(row, 0, 1, height);
  }
};

const opacityDrawer = memoize(
  (h: number) => (canvas: HTMLCanvasElement, width: number, height: number) => {
    let ctx = canvas.getContext("2d");
    const hv = h * 360;
    canvas.width = width;
    canvas.height = height;
    for (let row = 0; row <= width; row++) {
      ctx.fillStyle = `hsl(${hv}, 100%, ${((width - row) / width) * 50 + 50}%)`;
      ctx.fillRect(row, 0, 1, height);
    }
  }
);

const updateOpacity = (rgba: RGBA, [h, s, l]: HSLA) => {
  const l2 = rgbaToHsla(rgba)[2];
  return [h, s, l, lToA(l2)];
};

const lToA = (l) =>
  Number((1 - Math.min(0.5, Math.max(0, l - 0.5)) / 0.5).toFixed(2));

const updateHue = (rgba: RGBA, [, s, l, a]: HSLA) => [
  rgbaToHsla(rgba)[0],
  s,
  l,
  a,
];
const updateHSLA = (rgba: RGBA, [h, , , a]: HSLA) => {
  const [, s, l] = rgbaToHsla(rgba);
  return [h, s, l, a];
};

const rgbaToHsla = ([r, g, b, a]: RGBA) => {
  (r /= 255), (g /= 255), (b /= 255);
  let max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h,
    s,
    l = (max + min) / 2;
  if (max == min) {
    h = s = 0; // achromatic
  } else {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return [h, s, l, a];
};

const hueToRgb = (p, q, t) => {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
};

const hslaToRgba = ([h, s, l, a]: HSLA): RGBA => {
  let r, g, b;

  if (s == 0) {
    r = g = b = l;
  } else {
    let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    let p = 2 * l - q;
    r = hueToRgb(p, q, h + 1 / 3);
    g = hueToRgb(p, q, h);
    b = hueToRgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255), a];
};

const rgbToHsv = ([r, g, b]: RGBA) => {
  (r /= 255), (g /= 255), (b /= 255);

  var max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  var h,
    s,
    v = max;

  var d = max - min;
  s = max == 0 ? 0 : d / max;

  if (max == min) {
    h = 0; // achromatic
  } else {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }

    h /= 6;
  }

  return [h, s, v];
};

const hslToHsv = (hsl: HSLA) => rgbToHsv(hslaToRgba(hsl));

const parseRGBA = memoize((value: string): RGBA => {
  if (value.indexOf("rgba") !== -1) {
    return ((value.match(/[\d\.]+/g) as any) || [0, 0, 0, 1]).map(Number) as [
      number,
      number,
      number,
      number
    ];
  }
  let result =
    /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(value) ||
    /^#?([a-f\d]{1})([a-f\d]{1})([a-f\d]{1})$/i.exec(value);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
        1,
      ]
    : [0, 0, 0, 1];
});
