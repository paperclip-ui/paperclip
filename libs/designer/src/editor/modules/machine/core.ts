import { EventEmitter } from "events";

import { BaseMachine, MachineCreator } from "./base";
import { Engine, EngineCreator } from "./engine";
import { BaseEvent } from "./events";
import { Reducer, Store } from "./store";

/**
 * Combines state + side-effect handling.
 */

export class Machine<TState extends any, TEvent extends BaseEvent<any, any>>
  implements BaseMachine<TState, TEvent>
{
  private _engine: Engine<TState, TEvent>;

  private _store: Store<TState, TEvent>;

  constructor(
    reduceState: Reducer<TState, TEvent>,
    createEngine: EngineCreator<TState, TEvent>,
    initialState: TState
  ) {
    this._store = new Store(reduceState, initialState);
    this._engine = createEngine(this.dispatch, initialState);
  }

  getState() {
    return this._store.getState();
  }

  dispatch(event: TEvent) {
    const prevState = this._store.getState();
    this._store.dispatch(event);
    const currState = this._store.getState();
    this._engine.handleEvent(event, currState, prevState);
  }

  onStateChange(listener: (TState) => void) {
    return this._store.onStateChange(listener);
  }
  dispose() {
    this._engine.dispose();
    this._store.dispose();
  }
}

export const machineCreator =
  <TState extends any, TEvent extends BaseEvent<any, any>>(
    reduce: Reducer<TState, TEvent>,
    createEngine: EngineCreator<TState, TEvent>
  ): MachineCreator<TState, TEvent> =>
  (initialState: TState) =>
    new Machine(reduce, createEngine, initialState);
