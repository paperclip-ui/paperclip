import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Machine } from "../core";
import { BaseEvent, Dispatch } from "../events";

export const MachineContext = createContext<any>({});

const useMachine = <TState>(): Machine<TState, any> => {
  return useContext(MachineContext);
};

export const useSelector = <TSelector extends (...args: any) => any>(
  selector: TSelector
): ReturnType<TSelector> => {
  const machine = useMachine();
  const [state, setState] = useState(selector(machine.getState()));
  useEffect(() => {
    setState(selector(machine.getState()));
    return machine.onStateChange((state) => {
      setState(selector(state));
    });
  }, [machine]);
  return state;
};

export const useDispatch = <
  Event extends BaseEvent<any, any>
>(): Dispatch<Event> => {
  return useMachine().dispatch;
};

export const useInlineMachine = (reducer, engine, initialState) => {
  const machine = useMemo(() => {
    return new Machine(reducer, engine, initialState);
  }, []);
  const [state, setState] = useState(machine.getState());

  useEffect(() => {
    machine.onStateChange(setState);
  }, [machine]);

  return [state, machine.dispatch];
};
