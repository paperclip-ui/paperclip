import { BaseEvent, Dispatch } from "../events";

export type Engine<TState extends any, TEvent extends BaseEvent<any, any>> = {
  handleEvent: (event: TEvent, currState: TState, prevState: TState) => void;
  dispose: () => void;
};

export type EngineCreator<
  TState extends unknown,
  TEvent extends BaseEvent<any, any>
> = (
  dispatch: Dispatch<TEvent>,
  initialState?: TState
) => Engine<TState, TEvent>;
