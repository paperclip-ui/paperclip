import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as styles from "@paperclip-ui/designer/src/styles/color-picker.pc";
import { memoize } from "@paperclip-ui/common";
import classNames from "classnames";
import Color from "color";
import { startDOMDrag } from "@paperclip-ui/designer/src/components/utils/dnd";
// https://github.com/crcn/tandem-old/blob/10.0.0/packages/front-end/src/components/inputs/color/picker-controller.tsx#L66

type ColorInputProps = {
  value: string;
  onChange: (value: string) => void;
  onChangeComplete: (value: string) => void;
};

type RGBA = [number, number, number, number];
type HSLA = [number, number, number, number];

enum GrabberAxis {
  X = 1,
  Y = 2,
}

export const ColorInput = ({
  value,
  onChange,
  onChangeComplete,
}: ColorInputProps) => {
  const color: Color | null = useMemo(() => {
    try {
      return Color(value);
    } catch (e) {
      return null;
    }
  }, [value]);
  const [hsla, setHSLA] = useState<HSLA>(
    color ? normalizeColorHSL(color) : [0, 0, 0, 1]
  );

  const changeCallback = useMemo(
    () =>
      memoize(
        (callback) =>
          (updater: (curr: HSLA, prev: HSLA) => HSLA) =>
          (rgba: RGBA) => {
            const newValue = updater(rgbaToHsla(rgba), hsla);
            setHSLA(newValue);
            callback(stringifyRgba(hslaToRgba(newValue)));
          }
      ),
    [hsla]
  );

  const colorChangeCallback = changeCallback(onChange);
  const colorChangeCompleteCallback = changeCallback(onChangeComplete);

  return (
    <styles.ColorPicker>
      <ColorBox
        value={hsla}
        big
        draw={hslDrawer(hsla[0])}
        onChange={colorChangeCallback(updateHSLA)}
        onChangeComplete={colorChangeCompleteCallback(updateHSLA)}
        grabberAxis={GrabberAxis.X | GrabberAxis.Y}
        getGrapperPoint={hslPointer}
      />
      <ColorBox
        value={hsla}
        draw={hueDrawer}
        onChange={colorChangeCallback(updateHue)}
        onChangeComplete={colorChangeCompleteCallback(updateHue)}
        grabberAxis={GrabberAxis.X}
        getGrapperPoint={huePointer}
      />
      <ColorBox
        value={hsla}
        draw={opacityDrawer(hsla[0])}
        onChange={colorChangeCallback(updateOpacity)}
        onChangeComplete={colorChangeCompleteCallback(updateOpacity)}
        grabberAxis={GrabberAxis.X}
        getGrapperPoint={opacityPointer}
      />
    </styles.ColorPicker>
  );
};

type ColorBoxProps = {
  big?: boolean;
  draw: (ctx: HTMLCanvasElement, width: number, height: number) => void;
  value: HSLA;
  onChange: (rgba: RGBA) => void;
  getGrapperPoint: (
    hsla: HSLA,
    width: number,
    height: number
  ) => Record<string, number>;
  onChangeComplete: (rgba: RGBA) => void;
  grabberAxis: number;
};

const normalizeColorHSL = memoize((color: Color): HSLA => {
  return rgbaToHsla([color.red(), color.green(), color.blue(), color.alpha()]);
});

const ColorBox = ({
  grabberAxis,
  value: hsla,
  big,
  draw,
  getGrapperPoint,
  onChange,
  onChangeComplete,
}: ColorBoxProps) => {
  const ref = useRef<HTMLDivElement>();
  const canvasRef = useRef<HTMLCanvasElement>();
  const width = `100%`;
  const height = big ? `150px` : `24px`;

  const [size, setSize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });
  const [grabberPoint, setGrabberPoint] = useState<Record<string, any>>({});

  const onResize = useCallback(() => {
    setSize(ref.current.getBoundingClientRect());
  }, []);

  useEffect(() => {
    const observer = new ResizeObserver(onResize);
    observer.observe(ref.current);
    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (size?.width && size?.height) {
      setGrabberPoint(getGrapperPoint(hsla, size.width, size.height));
      draw(canvasRef.current, size.width, size.height);
    }
  }, [size, draw]);

  useEffect(() => {});

  const onMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current.getBoundingClientRect();

    const handleChange = (callback) => (event) => {
      const point = {
        left:
          grabberAxis & GrabberAxis.X
            ? Math.max(0, Math.min(rect.width - 1, event.clientX - rect.left))
            : 0,
        top:
          grabberAxis & GrabberAxis.Y
            ? Math.max(0, Math.min(rect.height - 1, event.clientY - rect.top))
            : 0,
      };
      if (callback) {
        const imageData = canvasRef.current
          .getContext("2d")
          .getImageData(point.left, point.top, 1, 1, {}).data;

        callback(imageData);
      }

      setGrabberPoint(point);
    };

    startDOMDrag(
      event.nativeEvent,
      null,
      handleChange(onChange),
      handleChange(onChangeComplete)
    );
  };

  return (
    <styles.ColorBox
      ref={ref}
      onMouseDown={onMouseDown}
      style={{ width, height }}
      class={classNames({
        big,
      })}
    >
      <canvas ref={canvasRef} />
      <Grabber
        style={{
          ...grabberPoint,
          transform: big ? `translate(-50%, -50%)` : `translateX(-50%)`,
        }}
      />
    </styles.ColorBox>
  );
};

type GrabberProps = {
  style: Record<string, any>;
};

const Grabber = ({ style }: GrabberProps) => {
  return <styles.ColorDrop style={style} />;
};

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

const opacityPointer = ([, , , a]: HSLA, width: number, height: number) => {
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

const updateOpacity = ([, , l2]: HSLA, [h, s, l]: HSLA): HSLA => {
  return [h, s, l, lToA(l2)];
};

const lToA = (l) =>
  Number((1 - Math.min(0.5, Math.max(0, l - 0.5)) / 0.5).toFixed(2));

const updateHue = ([h]: HSLA, [, s, l, a]: HSLA): HSLA => [h, s, l, a];

const updateHSLA = ([, s, l]: HSLA, [h, , , a]: HSLA): HSLA => {
  return [h, s, l, a];
};

const rgbaToHsla = ([r, g, b, a]: RGBA): HSLA => {
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
