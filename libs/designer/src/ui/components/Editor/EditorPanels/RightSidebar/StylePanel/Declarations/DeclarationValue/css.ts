import {
  DeclarationSuggestionMap,
  DeclarationValueType,
  declValueSuggestions,
} from "./css-utils";

const COLOR_OPTIONS = [
  "linear-gradient(%|%)",
  "rgba(%|%)",
  "hsl(%|%)",
  "rgb(%|%)",
  "lab(%|%)",
  "lch(%|%)",
];

// https://www.w3schools.com/cssref/css_units.php
const UNIT_OPTIONS = [
  // absolute
  "%|%cm",
  "%|%mm",
  "%|%in",
  "%|%px",
  "%|%pt",
  "%|%pc",

  // relative
  "%|%em",
  "%|%ex",
  "%|%ch",
  "%|%rem",
  "%|%vw",
  "%|%vh",
  "%|%vmin",
  "%|%vmax",
  "%|%%",
];

const GLOBAL_VALUES = [
  "inherit",
  "initial",
  "unset",
  "revert",
  "none",
  "auto",
  "normal",
];

const OVERFLOW_VALUES = [
  "visible",
  "hidden",
  "scroll",
  "auto",
  ...GLOBAL_VALUES,
];

const BACKGROUND_IMAGE_OPTIONS = [...COLOR_OPTIONS, "url(%|%)"];

const BACKGROUND_REPEAT_OPTIONS = ["repeat", "no-repeat"];

// https://developer.mozilla.org/en-US/docs/Web/CSS/background-size
const BACKGROUND_SIZE_OPTIONS = [
  ...GLOBAL_VALUES,
  "container",
  "cover",
  "auto",
];

const FONT_FAMILY_VALUES = [...GLOBAL_VALUES];

export const declSuggestionMap: DeclarationSuggestionMap = {
  // --- LAYOUT ---
  display: declValueSuggestions(
    [DeclarationValueType.Keyword],
    ["block", "inline", "inline-block", "flex", "grid", "none"]
  ),
  position: declValueSuggestions(
    [DeclarationValueType.Keyword],
    ["relative", "absolute", "fixed", "static"]
  ),

  // --- STYLE ---
  background: declValueSuggestions(
    [DeclarationValueType.Color],
    [...BACKGROUND_REPEAT_OPTIONS, ...BACKGROUND_IMAGE_OPTIONS]
  ),
  "background-size": declValueSuggestions(
    [DeclarationValueType.Keyword, DeclarationValueType.Unit],
    [...BACKGROUND_SIZE_OPTIONS]
  ),
  color: declValueSuggestions([DeclarationValueType.Color], [...COLOR_OPTIONS]),
  "font-family": declValueSuggestions(
    [DeclarationValueType.Keyword],
    [...FONT_FAMILY_VALUES]
  ),
  "text-overflow": declValueSuggestions(
    [DeclarationValueType.Color],
    ["clip", "ellipsis", ...GLOBAL_VALUES]
  ),
  "white-space": declValueSuggestions(
    [DeclarationValueType.Color],
    ["normal", "nowrap", "pre", "pre-line", "pre-wrap", ...GLOBAL_VALUES]
  ),
  overflow: declValueSuggestions([DeclarationValueType.Color], OVERFLOW_VALUES),
  "overflow-x": declValueSuggestions(
    [DeclarationValueType.Color],
    OVERFLOW_VALUES
  ),
  "overflow-y": declValueSuggestions(
    [DeclarationValueType.Color],
    OVERFLOW_VALUES
  ),
  "font-size": declValueSuggestions(
    [DeclarationValueType.Unit],
    [...UNIT_OPTIONS]
  ),
};

export const defaultDeclSuggestions = declValueSuggestions(
  Object.values(DeclarationValueType),
  GLOBAL_VALUES
);
