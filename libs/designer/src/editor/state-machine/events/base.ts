/**
 * Base event for event sourcing (https://martinfowler.com/eaaDev/EventSourcing.html)
 */

export type BaseEvent<TType = string, TPayload = unknown> = {
  type: TType;
  payload?: TPayload;
};

export type Dispatch<TEvent = BaseEvent> = (event: TEvent) => void;
