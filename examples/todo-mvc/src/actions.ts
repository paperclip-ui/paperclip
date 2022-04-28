import { Action } from "redux";
import { TodoItem, TodoItemFilter } from "./state";

export enum ActionType {
  TODO_INPUT_ENTERED = "TODO_INPUT_ENTERED",
  TODO_ITEM_COMPLETE_CHECKBOX_CLICKED = "TODO_ITEM_COMPLETE_CHECKBOX_CLICKED",
  TODO_LIST_CLEAR_COMPLETED_CLICKED = "TODO_LIST_CLEAR_COMPLETED_CLICKED",
  TODO_ITEM_FILTER_BUTTON_CLICKED = "TODO_ITEM_FILTER_BUTTON_CLICKED"
}

export type TodoInputEntered = {
  value: string;
} & Action<ActionType.TODO_INPUT_ENTERED>;

export type TodoItemCompleteCheckboxClicked = {
  item: TodoItem;
} & Action<ActionType.TODO_ITEM_COMPLETE_CHECKBOX_CLICKED>;

export type TodoListCleareCompletedClicked = {} & Action<
  ActionType.TODO_LIST_CLEAR_COMPLETED_CLICKED
>;

export type TodoItemFilterButtonClicked = {
  filterType: TodoItemFilter;
} & Action<ActionType.TODO_ITEM_FILTER_BUTTON_CLICKED>;

export type TodoAppAction =
  | TodoInputEntered
  | TodoItemCompleteCheckboxClicked
  | TodoListCleareCompletedClicked
  | TodoItemFilterButtonClicked;

export const todoInputEntered = (value: string): TodoInputEntered => ({
  type: ActionType.TODO_INPUT_ENTERED,
  value
});

export const todoItemCompleteCheckboxClicked = (
  item: TodoItem
): TodoItemCompleteCheckboxClicked => ({
  type: ActionType.TODO_ITEM_COMPLETE_CHECKBOX_CLICKED,
  item
});

export const todoListClearCompletedClicked = (): TodoListCleareCompletedClicked => ({
  type: ActionType.TODO_LIST_CLEAR_COMPLETED_CLICKED
});

export const todoFilterItemButtonClicked = (
  filterType: TodoItemFilter
): TodoItemFilterButtonClicked => ({
  type: ActionType.TODO_ITEM_FILTER_BUTTON_CLICKED,
  filterType
});
