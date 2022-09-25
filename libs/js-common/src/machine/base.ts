import { Machine } from "./core";
import { BaseEvent } from "./events";

/**
 */

export type BaseMachine<
  TState extends any,
  TEvent extends BaseEvent<any, any>
> = {
  dispatch(event: TEvent): void;
  onStateChange(listener: (TState) => void): void;
  getState(): TState;
};

/**
 */

export type MachineCreator<
  TState extends any,
  TEvent extends BaseEvent<any, any>
> = (initialState: TState) => Machine<TState, TEvent>;
