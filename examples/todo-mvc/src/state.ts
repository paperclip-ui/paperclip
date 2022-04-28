export enum TodoItemFilter {
  ALL,
  ACTIVE,
  COMPLETED
}

export type TodoItem = {
  id: string;
  completed: boolean;
  label: string;
};

export type RootState = {
  todos: TodoItem[];
  filter: TodoItemFilter;
};

let idCount = 0;
const seed = Date.now();

export const createTodo = (label: string): TodoItem => ({
  id: `${seed}${idCount++}`,
  label,
  completed: false
});
