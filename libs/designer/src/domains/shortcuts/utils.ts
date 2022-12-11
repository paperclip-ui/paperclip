import { isEqual } from "lodash";
import { keyboardEvents } from "../keyboard/events";

export const getKeysDown = ({
  payload: { key, shiftKey, metaKey, altKey, ctrlKey },
}: ReturnType<typeof keyboardEvents.keyDown>) => {
  const keysDown = [key.toLowerCase()];

  if (shiftKey) {
    keysDown.push("shift");
  }
  if (metaKey) {
    keysDown.push("meta");
  }
  if (altKey) {
    keysDown.push("alt");
  }
  if (ctrlKey) {
    keysDown.push("control");
  }
  return keysDown;
};

export const isKeyComboDown = (
  combo: string[],
  event: ReturnType<typeof keyboardEvents.keyDown>
) => {
  const keysDown = getKeysDown(event);

  if (isEqual([...keysDown].sort(), [...combo].sort())) {
    return true;
  }
  return false;
};
