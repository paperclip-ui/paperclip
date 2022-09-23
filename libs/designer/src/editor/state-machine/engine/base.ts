import { BaseEvent, Dispatch } from "../events";

export type Engine<TState = unknown, TEvent = BaseEvent> = {
  handleEvent: (event: TEvent, currState: TState, prevState: TState) => void;
  dispose: () => void;
};

export type EngineCreator<TState = unknown, TEvent = BaseEvent> = (
  dispatch: Dispatch<TEvent>,
  initialState?: TState
) => Engine<TState, TEvent>;
