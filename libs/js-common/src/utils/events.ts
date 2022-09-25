import { EventEmitter } from "events";

export const eventListener = (
  em: EventEmitter,
  type: string,
  listener: any
) => {
  em.on(type, listener);
  return () => em.off(type, listener);
};
