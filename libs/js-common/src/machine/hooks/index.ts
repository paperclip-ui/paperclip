import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Machine } from "../core";
import { Dispatch } from "../events";

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
  }, [machine, selector]);
  return state;
};

export const useDispatch = (): Dispatch<any> => {
  return useMachine().dispatch;
};
