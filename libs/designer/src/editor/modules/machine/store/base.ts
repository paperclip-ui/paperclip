import { BaseEvent } from "../events";

export type Reducer<TState extends any, TEvent extends BaseEvent<any, any>> = (
  state: TState,
  event: TEvent
) => TState;
