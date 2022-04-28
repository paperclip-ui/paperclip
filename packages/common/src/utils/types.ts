export type RecursivePartial<T> = {
  [P in keyof T]?: T[P] | RecursivePartial<T[P]>
};

export type KeyValue<V> = {
  [identifier: string]: V;
};
