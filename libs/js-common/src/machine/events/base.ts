/**
 * Base event for event sourcing (https://martinfowler.com/eaaDev/EventSourcing.html)
 */

export type BaseEvent<TType extends string, TPayload = unknown> = {
  type: TType;
  payload?: TPayload;
};

export type Dispatch<TEvent extends BaseEvent<any, any>> = (
  event: TEvent
) => void;
