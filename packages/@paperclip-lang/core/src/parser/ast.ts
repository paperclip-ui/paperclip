enum ExpressionKind {
  /*

  component Test {
    test: 1
  }
  */
  Component,

  // div {},
  Instance,

  // If condition { }
  If,

  // (a:b, c:d)
  Parameters,

  // 1px 1em
  Measurement,

  // 1, 100, -100
  Number,

  /*
  style {
    background: red
    
  }
  */
  Style,

  Text,
  Element,
  Fragment,
  SingleLineComment,
  MultiLineComment,
}

export type Raws = {
  before: string;
  after: string;
};

export type BaseExpression<TKind extends ExpressionKind> = {
  raws: Raws;
  kind: TKind;
};

export type Component = {
  name: string;
  extends: string;
  render: VisibleNode;
};

export type Element = {
  children: Node;
};

export type Fragment = {
  children: Node[];
} & BaseExpression<ExpressionKind.Fragment>;

export type Text = {
  value: string;
};

export type MultiLineComment = {
  value: string;
} & BaseExpression<ExpressionKind.MultiLineComment>;

export type SingleLineComment = {
  value: string;
} & BaseExpression<ExpressionKind.SingleLineComment>;

export type Comment = MultiLineComment | SingleLineComment;

export type VisibleNode = Text | Element | Fragment;
export type Node = VisibleNode | Comment;
