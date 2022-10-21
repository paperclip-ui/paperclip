import { EventEmitter } from "events";
import { isEqual } from "lodash";

export class ObservableMap<TState> {
  private _state: TState;
  private _em: EventEmitter;
  constructor(initialState: TState, bind?: (state: TState) => void) {
    this._state = Object.freeze({ ...initialState });
    this._em = new EventEmitter();
    if (bind) {
      this.bind(bind);
    }
  }
  getState() {
    return this._state;
  }
  dispose() {
    this._em = new EventEmitter();
  }
  bind<TSelectedValue extends any = TState>(
    listener: (state: TSelectedValue) => void,
    select: (state: TState) => TSelectedValue = identity
  ) {
    listener(select(this.getState()));
    return this.onChange(listener, select);
  }
  onChange<TSelectedValue extends any = TState>(
    listener: (newState: TSelectedValue, oldState: TSelectedValue) => void,
    select: (state: TState) => TSelectedValue = identity
  ) {
    const onChange = (newState: TState, oldState: TState) => {
      const newValue = select(newState);
      const oldValue = select(oldState);
      if (!isEqual(newValue, oldValue)) {
        listener(newValue, oldValue);
      }
    };

    this._em.on("change", onChange);
    return () => {
      this._em.off("change", onChange);
    };
  }
  update(updater: (state: TState) => TState) {
    const newState = Object.freeze(updater(this._state));

    if (this._state !== newState) {
      const oldState = this._state;
      this._state = newState;
      this._em.emit("change", newState, oldState);
    }
  }
}

const identity = (v) => v;
