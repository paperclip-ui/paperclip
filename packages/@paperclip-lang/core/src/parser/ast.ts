export enum ExpressionKind {
  Document = "Document",

  Import = "Import",

  /*

  component Test {
    test: 1
  }
  */
  Component = "Component",

  // div {},
  Instance = "Instance",

  // If condition { }
  If = "If",

  // (a:b, c:d)
  Parameters = "Parameters",

  // 1px 1em
  Measurement = "Measurement",

  // 1, 100, -100
  Number = "Number",

  /*
  style {
    background: red
    
  }
  */
  Style = "Style",

  Text = "Text",
  Render = "Render",
  Element = "Element",
  Fragment = "Fragment",
  SingleLineComment = "SingleLineComment",
  MultiLineComment = "MultiLineComment",
}

export type Raws = {
  before: string;
  after: string;
};

export type BaseExpression<TKind extends ExpressionKind> = {
  raws: Raws;
  kind: TKind;
};

export type Document = {
  expressions: DocumentExpression[];
} & BaseExpression<ExpressionKind.Document>;

export type Import = {
  path: string;
} & BaseExpression<ExpressionKind.Import>;

export type Component = {
  name: string;
  body: ComponentBodyExpression;
} & BaseExpression<ExpressionKind.Component>;

export type ComponentBodyExpression = Render;

export type Element = {
  children: Node;
} & BaseExpression<ExpressionKind.Element>;

export type Fragment = {
  children: Node[];
} & BaseExpression<ExpressionKind.Fragment>;

export type Text = {
  value: string;
} & BaseExpression<ExpressionKind.Text>;

export type Render = {
  node: VisibleNode;
} & BaseExpression<ExpressionKind.Render>;

export type MultiLineComment = {
  value: string;
} & BaseExpression<ExpressionKind.MultiLineComment>;

export type SingleLineComment = {
  value: string;
} & BaseExpression<ExpressionKind.SingleLineComment>;

export type Comment = MultiLineComment | SingleLineComment;

export type VisibleNode = Text | Element | Fragment;
export type Node = VisibleNode | Comment;
export type DocumentExpression = Node | Component;
export type BodyExpression = Component | Node;
