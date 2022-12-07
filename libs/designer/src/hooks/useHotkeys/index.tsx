import { MutableRefObject, useEffect, useRef, useState } from "react";
import { without, isEqual } from "lodash";

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

export const isKeyComboDown = (combo: string, event: KeyboardEvent) => {
  const comboParts = combo.toLowerCase().split("+").sort();
  const keysDown = getKeysDown(event);

  const sortedKeysDown = [...keysDown].sort();

  if (isEqual(sortedKeysDown, comboParts)) {
    return true;
  }
  return false;
};

export const useHotkeys = (
  handlers: Record<string, (event: KeyboardEvent) => void>,
  ref: MutableRefObject<HTMLElement>
) => {
  useEffect(() => {
    if (!ref.current) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      for (const combo in handlers) {
        if (isKeyComboDown(combo, event)) {
          event.preventDefault();
          handlers[combo](event);
        }
      }
    };

    ref.current.addEventListener("keydown", onKeyDown);

    return () => {
      ref.current.removeEventListener("keydown", onKeyDown);
    };
  }, [ref.current]);
  return { ref };
};
