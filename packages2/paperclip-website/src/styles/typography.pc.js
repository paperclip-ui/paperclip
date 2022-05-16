import React from "react";
import _pubD9B10930 from "./colors.pc";
import _pub5327C5Ce from "./fonts/roboto/font-face.pc";
import _pubE8481E9D from "./fonts/sora/font-face.pc";
import _pubBdda4Eef from "./fonts/open-sans/font-face.pc";
function getDefault(module) {
  return module.default || module;
}

function castStyle(value) {
  var tov = typeof value;
  if (tov === "object" || tov !== "string" || !value) return value;
  return value
    .trim()
    .split(";")
    .reduce(function (obj, keyValue) {
      var kvp = keyValue.split(":");
      var key = kvp[0];
      var value = kvp[1];
      if (!value || value === "undefined") return obj;
      var trimmedValue = value.trim();
      if (trimmedValue === "undefined" || !trimmedValue) return obj;
      obj[key.trim()] = trimmedValue;
      return obj;
    }, {});
}

export const classNames = {
  light: "_pub-62dca9e0_light",
  "semi-bold": "_pub-62dca9e0_semi-bold",
  "text-default": "_pub-62dca9e0_text-default",
  "text-secondary": "_pub-62dca9e0_text-secondary",
};
