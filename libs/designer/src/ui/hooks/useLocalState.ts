import { useMemo } from "react";
import { useState } from "react";

export const useLocalState = <Value>(
  name: string,
  value: Value
): [Value, (value: Value) => void] => {
  const initial = useMemo(() => {
    const value = localStorage.getItem(name);
    return value ? JSON.parse(value) : undefined;
  }, []);

  const [internal, setInternal] = useState<Value>(initial ?? value);

  return [
    internal,
    (value: Value) => {
      setInternal(value);
      localStorage.setItem(name, JSON.stringify(value));
    },
  ];
};
