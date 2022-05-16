import * as zmodel from "@zeplin/extension-model";
import { pickBy, identity } from "lodash";

export const castColor = (color: any) => new zmodel.Color(color);

export const castLayer = ({
  id,
  source_id,
  type,
  name,
  rect,
  fills,
  borders,
  shadows,
  blur,
  opacity,
  blend_mode,
  border_radius,
  text_styles,
}: any) => {
  return {
    id,
    source_id,
    type,
    name,
    rect,
    fills: fills.map((fill: any) => {
      return new zmodel.Fill({
        ...fill,
        color: castColor(fill.color),
      });
    }),
    borders,
    shadows: shadows.map(castShadow),
    blur,
    opacity,
    blendMode: blend_mode,
    borderRadius: border_radius,
    textStyles:
      (text_styles &&
        text_styles.map((text: any) => castTextStyle(text.style))) ||
      [],
  };
};

export const castTextStyle = (style: any) => {
  return pickBy(
    {
      name: style.name,
      fontFamily: style.font_family,
      fontSize: style.font_size,
      fontWeight: style.font_weight,
      fontStyle: style.font_style,
      fontStretch: style.font_stretch,
      color: style.color && new zmodel.Color(style.color),
    },
    identity
  );
};

const castShadow = ({
  type,
  offset_x,
  offset_y,
  spread,
  color,
  blur_radius,
  ...rest
}: any) => {
  return {
    type,
    offsetX: offset_x,
    offsetY: offset_y,
    blurRadius: blur_radius,
    spread: spread,
    color: new zmodel.Color(color),
  };
};
