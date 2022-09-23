import { BaseEvent } from "../events";
import { Reducer } from "./base";

type ChangeListener<TState> = (state: TState) => void;

export class Store<TState extends Object, TEvent extends BaseEvent<any, any>> {
  private _changeListeners: ChangeListener<TState>[] = [];
  private _state: TState;

  constructor(
    private _reduceState: Reducer<TState, TEvent>,
    private _initialState: TState
  ) {
    this._state = Object.freeze({ ...this._initialState });
  }

  getState() {
    return this._state;
  }

  dispose() {
    this._changeListeners = [];
  }

  dispatch(event: TEvent) {
    this._state = this._reduceState(this._state, event);

    // traverse backwards in case a listener is disposed in interation
    for (let i = this._changeListeners.length; i--; ) {
      this._changeListeners[i](this._state);
    }
  }

  onStateChange(listener: ChangeListener<TState>) {
    this._changeListeners.push(listener);
    return () => {
      let i = this._changeListeners.indexOf(listener);
      if (i !== -1) {
        this._changeListeners.splice(i, 1);
      }
    };
  }
}
