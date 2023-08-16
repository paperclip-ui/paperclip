import { BaseEvent, Dispatch } from "../events";
import { Engine, EngineCreator } from "./base";

export const combineEngineCreators =
  <TState extends any, TEvent extends BaseEvent<any, any>>(
    ...engineCreators: EngineCreator<TState, TEvent>[]
  ) =>
  (
    dispatch: Dispatch<TEvent>,
    getState: () => TState
  ): Engine<TState, TEvent> => {
    const engines = engineCreators.map((createEngine) =>
      createEngine(dispatch, getState)
    );

    const handleEvent = (event: TEvent, currState: TState, prevState: TState) =>
      engines.forEach((engine) => {
        engine.handleEvent && engine.handleEvent(event, currState, prevState);
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
