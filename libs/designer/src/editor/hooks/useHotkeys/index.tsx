import { MutableRefObject, useEffect, useRef, useState } from "react";
import { without, isEqual } from "lodash";

export const useHotkeys = (
  handlers: Record<string, (event: KeyboardEvent) => void>,
  ref: MutableRefObject<HTMLElement>
) => {
  const [keysDown, setKeysDown] = useState<string[]>([]);

  const handleKeyDown = (event: KeyboardEvent, keysDown: string[]) => {
    const sortedKeysDown = [...keysDown].sort();
    for (const combo in handlers) {
      const comboParts = combo.toLowerCase().split("+").sort();
      if (isEqual(sortedKeysDown, comboParts)) {
        handlers[combo](event);
      }
    }
  };

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      setKeysDown((keysDown) => {
        const newKeysDown = [...keysDown, event.key.toLowerCase()];
        handleKeyDown(event, newKeysDown);
        return newKeysDown;
      });
    };

    const onKeyUp = (event: KeyboardEvent) => {
      setKeysDown((keysDown) => {
        return without(keysDown, event.key.toLowerCase());
      });
    };

    ref.current.addEventListener("keydown", onKeyDown);
    ref.current.addEventListener("keyup", onKeyUp);

    return () => {
      ref.current.removeEventListener("keydown", onKeyDown);
      ref.current.removeEventListener("keyup", onKeyUp);
    };
  }, [ref.current]);
  return { ref };
};
