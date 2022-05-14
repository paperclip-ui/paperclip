import { Action, Store, Dispatch } from "redux";

/**
 * Engines handle side-effects of the application and drive
 * much of the application behavior.
 */

export type InitEngine<TState, TAction extends Action = Action> = (
  dispatch: Dispatch<TAction>,
  initialState: TState
) => EngineActionHandler<TState>;

export type EngineActionHandler<TState> = (
  action: Action,
  state: TState,
  prevState?: TState
) => void;

export const engineReduxMiddleware = <TState>(
  engineCreators: Array<InitEngine<TState>>
) => {
  return (store: Store<TState>) => {
    let currState: TState = store.getState();

    const engineActionHandlers = engineCreators.map((createEngine) =>
      createEngine(store.dispatch, currState)
    );

    return (next: (action: Action) => void) => {
      return (action: Action) => {
        console.log("ACC", action.type);

        // Do this now so that the action is handled by the store
        next(action);

        const nextState = store.getState();

        for (const handleAction of engineActionHandlers) {
          handleAction(action, nextState, currState);
        }

        currState = nextState;
      };
    };
  };
};
