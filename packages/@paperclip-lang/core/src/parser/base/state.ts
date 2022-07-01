export type BaseToken<TKind extends number> = {
  kind: TKind;
  value: string;
};

export type SourceLocation = {
  column: number;
  line: number;
  pos: number;
};
