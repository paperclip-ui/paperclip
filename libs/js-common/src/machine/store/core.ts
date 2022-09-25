import { ObservableMap } from "../../observable/map";
import { BaseEvent } from "../events";
import { Reducer } from "./base";

type ChangeListener<TState> = (state: TState) => void;

export class Store<TState extends Object, TEvent extends BaseEvent<any, any>> {
  private _inner: ObservableMap<TState>;

  constructor(
    private _reduceState: Reducer<TState, TEvent>,
    private _initialState: TState
  ) {
    this._inner = new ObservableMap(this._initialState);
  }

  getState() {
    return this._inner.getState();
  }

  dispose() {
    this._inner.dispose();
  }

  dispatch(event: TEvent) {
    this._inner.update((state) => this._reduceState(state, event));
  }

  onStateChange(listener: ChangeListener<TState>) {
    return this._inner.onChange(listener);
  }
}
