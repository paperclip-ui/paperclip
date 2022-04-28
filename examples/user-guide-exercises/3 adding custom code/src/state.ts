export type RootState = {
  currentInputValue?: string;
  todoItems: TodoItem[];
};

export type TodoItem = {
  label: string;
  completed: boolean;
  id: string;
};

const seed = `${Date.now()}-${Math.round(Math.random() * 9999999999)}`;
let idCount = 0;

export const createTodoItem = (label: string): TodoItem => ({
  id: `${seed}-${idCount++}`,
  label,
  completed: false
});

export const addTodoItem = (label: string, state: RootState) => ({
  ...state,
  todoItems: [...state.todoItems, createTodoItem(label)]
});

export const clearCompleted = (state: RootState): RootState => ({
  ...state,
  todoItems: state.todoItems.filter(item => !item.completed)
});

export const toggleCompleted = (todoItemId: string, state: RootState) => ({
  ...state,
  todoItems: state.todoItems.map(item => {
    if (item.id === todoItemId) {
      return { ...item, completed: !item.completed };
    }
    return item;
  })
});
