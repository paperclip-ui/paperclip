import { BaseEvent, Dispatch } from "../events";
import { Engine, EngineCreator } from "./base";

export const combineEngineCreators =
  <TState = unknown, TEvent = BaseEvent>(
    ...engineCreators: EngineCreator<TState, TEvent>[]
  ) =>
  (dispatch: Dispatch<TEvent>): Engine<TState, TEvent> => {
    const engines = engineCreators.map((createEngine) =>
      createEngine(dispatch)
    );

    const handleEvent = (event: TEvent, currState: TState, prevState: TState) =>
      engines.forEach((engine) => {
        engine.handleEvent(event, currState, prevState);
      });

    const dispose = () =>
      engines.forEach((engine) => {
        engine.dispose();
      });

    return {
      handleEvent,
      dispose,
    };
  };
