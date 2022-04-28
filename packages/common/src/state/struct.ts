export type Struct = {
  type: any;
  id: string;
};

export type StructReference<T extends any> = {
  id: string;
  type: T;
};
