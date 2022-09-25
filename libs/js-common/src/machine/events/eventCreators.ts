import { BaseEvent } from "./base";

type Key = string | number;

type Namespaced<
  TName extends Key,
  TNamespace extends Key
> = `${TNamespace}/${TName}`;

type PayloadCreator = ((...args: any) => any) | null;
declare type EventCreatorsBase = {
  [key: string]: PayloadCreator;
};
type EventCreator<
  TType extends string,
  TPayloadCreator extends PayloadCreator
> = TPayloadCreator extends (...args: any) => any
  ? (
      ...params: Parameters<TPayloadCreator>
    ) => BaseEvent<TType, ReturnType<TPayloadCreator>>
  : () => BaseEvent<TType>;
export declare type EventCreators<
  TCreators extends EventCreatorsBase,
  TNamespace extends Key
> = {
  [key in keyof TCreators & Key]: EventCreator<
    Namespaced<key, TNamespace>,
    TCreators[key]
  > & {
    type: Namespaced<key, TNamespace>;
  };
};
/**
 * Event creator factors.
 *
 * Example:
 *
 * export const events = eventCreators({
 *   somethingHappened: (payload: { name: string }) => payload
 * })
 */
export const eventCreators = <
  TCreators extends Record<string, PayloadCreator>,
  TNamespace extends string
>(
  payloadCreators: TCreators,
  namespace: TNamespace
): EventCreators<TCreators, TNamespace> => {
  return Object.entries(payloadCreators).reduce(
    (eventCreators: any, [type, createPayload]) => {
      // create new factory for event types
      const namespacedType = `${namespace}/${type}`;

      const createEvent = (...args: any) => ({
        type: namespacedType,
        payload: createPayload && createPayload(...args),
      });

      // specify namespace ot avoid collisions
      createEvent.type = namespacedType;

      eventCreators[type] = createEvent;

      return eventCreators;
    },
    {}
  ) as EventCreators<TCreators, TNamespace>;
};

/**
 * export const events = eventCreators({
 *   somethingHappened: identity as Identity<Payload>,
 * })
 *
 * export type MyEvent = ExtractJoinedEventFromCreators<typeof events>;
 */

export type ExtractEventFromCreators<
  TCreators extends Record<string, (payload: any) => unknown>
> = ReturnType<TCreators[keyof TCreators]>;

/**
 * Shorthand for (v: { name: string }) => v
 *
 * eventCreators({
 *   somethingHappened: identity as Identity<{name: string }>
 * })
 */

export const identity =
  <TPayload>() =>
  (value: TPayload) =>
    value;
