export const isUnitValue = (value) =>
  /(cm|mm|in|px|pt|pc|em|ex|ch|rem|vw|vh|vmin|vmax|%)/.test(value);

export const isColorValue = (value) =>
  /(rgba?|hsla?|hwb|lab|lch|color|color-mix)\(/.test(value);
