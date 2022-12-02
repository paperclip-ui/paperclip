import { MutableRefObject, useEffect, useRef, useState } from "react";
import { without, isEqual } from "lodash";

export const useHotkeys = (
  handlers: Record<string, (event: KeyboardEvent) => void>,
  ref: MutableRefObject<HTMLElement>
) => {
  const handleKeyDown = (event: KeyboardEvent, keysDown: string[]) => {};

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
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

      const sortedKeysDown = [...keysDown].sort();

      for (const combo in handlers) {
        const comboParts = combo.toLowerCase().split("+").sort();
        if (isEqual(sortedKeysDown, comboParts)) {
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
