import { Selected } from "./events";

export type StatefulProps = {
  open: boolean;
  multi: boolean;
  values: any[];
};

export type State = {
  props: StatefulProps;
  isOpen: boolean;
  customValue?: string;
  preselectedIndex: number;
};

export const getInitialState = (props: StatefulProps): State => ({
  props,
  isOpen: false,
  preselectedIndex: 0,
});

export const isOpen = (state: State) => state.props.open ?? state.isOpen;

export const getSelectedValues = (
  value: any,
  { props: { multi, values } }: State
) => {
  let newValues: any[] = [];

  if (multi) {
    if (!values.includes(value)) {
      newValues = [...values, value];
    } else {
      newValues = values.filter((existing) => existing !== value);
    }
  } else {
    newValues = [value];
  }

  return newValues;
};
