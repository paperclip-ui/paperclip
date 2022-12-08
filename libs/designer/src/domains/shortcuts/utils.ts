import { isEqual } from "lodash";

export const getKeysDown = (event: KeyboardEvent) => {
  const keysDown = [event.key.toLowerCase()];

  if (event.shiftKey) {
    keysDown.push("shift");
  }
  if (event.metaKey) {
    keysDown.push("meta");
  }
  if (event.altKey) {
    keysDown.push("alt");
  }
  if (event.ctrlKey) {
    keysDown.push("ctrl");
  }
  return keysDown;
};

export const isKeyComboDown = (combo: string[], event: KeyboardEvent) => {
  const keysDown = getKeysDown(event);

  const sortedKeysDown = [...keysDown].sort();

  if (isEqual(sortedKeysDown, combo)) {
    return true;
  }
  return false;
};
