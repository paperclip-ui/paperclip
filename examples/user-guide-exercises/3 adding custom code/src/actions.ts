import { Action } from "redux";
import { TodoItem } from "./state";

export enum TodoAppActionType {
  ADD_ITEM_INPUT_ENTERED = "ADD_ITEM_INPUT_ENTERED",
  ADD_ITEM_INPUT_CHANGED = "ADD_ITEM_INPUT_CHANGED",
  CLEAR_COMPLETED_BUTTON_CLICKED = "CLEAR_COMPLETED_BUTTON_CLICKED",
  ADD_ITEM_BUTTON_CLICKED = "ADD_ITEM_BUTTON_CLICKED",
  TOGGLE_ITEM_CLICKED = "TOGGLE_ITEM_CLICKED"
}

export type AddItemInputEntered = {} & Action<
  TodoAppActionType.ADD_ITEM_INPUT_ENTERED
>;

export type AddItemButtonClicked = {} & Action<
  TodoAppActionType.ADD_ITEM_BUTTON_CLICKED
>;

export type AddItemInputChanged = {
  value: string;
} & Action<TodoAppActionType.ADD_ITEM_INPUT_CHANGED>;

export type ToggleItemClicked = {
  item: TodoItem;
} & Action<TodoAppActionType.TOGGLE_ITEM_CLICKED>;

export type ClearCompletedButtonClicked = {} & Action<
  TodoAppActionType.CLEAR_COMPLETED_BUTTON_CLICKED
>;

export type TodoAppAction =
  | AddItemButtonClicked
  | AddItemInputEntered
  | ClearCompletedButtonClicked
  | AddItemInputChanged
  | ToggleItemClicked;

export const addItemButtonClicked = (): AddItemButtonClicked => ({
  type: TodoAppActionType.ADD_ITEM_BUTTON_CLICKED
});

export const addItemInputEntered = (): AddItemInputEntered => ({
  type: TodoAppActionType.ADD_ITEM_INPUT_ENTERED
});

export const addItemInputChanged = (value: string): AddItemInputChanged => ({
  value,
  type: TodoAppActionType.ADD_ITEM_INPUT_CHANGED
});

export const clearCompletedButtonClicked = (): ClearCompletedButtonClicked => ({
  type: TodoAppActionType.CLEAR_COMPLETED_BUTTON_CLICKED
});

export const toggleItemClicked = (item: TodoItem): ToggleItemClicked => ({
  item,
  type: TodoAppActionType.TOGGLE_ITEM_CLICKED
});
