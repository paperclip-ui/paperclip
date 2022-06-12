import { DocComment } from "../docco/ast";

export enum ExpressionKind {
  Document = "Document",

  Import = "Import",
  Token = "Token",
  Array = "Array",

  /*

  component Test {
    test: 1
  }
  */
  Component = "Component",
  Override = "Override",

  // div {},
  Instance = "Instance",

  // (a:b, c:d)
  Parameter = "Parameter",
  String = "String",
  Reference = "Reference",

  // 1px 1em
  Measurement = "Measurement",

  // 1, 100, -100
  Number = "Number",
  Boolean = "Boolean",

  /*
  style {
    background: red
    
  }
  */
  Style = "Style",
  StyleCondition = "StyleCondition",
  StyleDeclaration = "StyleDeclaration",

  Text = "Text",
  Variant = "Variant",
  Render = "Render",
  Element = "Element",
  Fragment = "Fragment",
  SingleLineComment = "SingleLineComment",
  MultiLineComment = "MultiLineComment",
}

export type Raws = {
  before?: string;
  after?: string;
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
  namespace: string;
} & BaseExpression<ExpressionKind.Import>;

export type ValueToken = {
  isPublic?: boolean;
  name: string;
  value: string;
} & BaseExpression<ExpressionKind.Token>;

export type Component = {
  name: string;
  body: ComponentBodyExpression[];
  docComment?: DocComment;
  isPublic?: boolean;
} & BaseExpression<ExpressionKind.Component>;

export type ComponentBodyExpression = Render | Variant;

export type Parameter = {
  raws: Raws;
  name: string;
  value: ValueExpression;
} & BaseExpression<ExpressionKind.Parameter>;

export type StringExpression = {
  value: string;
} & BaseExpression<ExpressionKind.String>;

export type NumberExpression = {
  value: number;
} & BaseExpression<ExpressionKind.Number>;

export type BooleanExpression = {
  value: boolean;
} & BaseExpression<ExpressionKind.Boolean>;

export type Reference = {
  path: string[];
} & BaseExpression<ExpressionKind.Reference>;

export type ArrayExpression = {
  items: ValueExpression[];
} & BaseExpression<ExpressionKind.Array>;

export type ValueExpression =
  | StringExpression
  | NumberExpression
  | BooleanExpression
  | Reference
  | ArrayExpression;

export type ElementChild = Style | Node | Override;

export type Style = {
  name?: string;
  body: StyleBodyExpression[];
  isPublic?: boolean;
} & BaseExpression<ExpressionKind.Style>;

export type StyleBodyExpression = StyleCondition | StyleDeclaration;

export type StyleCondition = {
  conditionName: string;
  body: StyleBodyExpression[];
} & BaseExpression<ExpressionKind.StyleCondition>;

export type StyleDeclaration = {
  name: string;
  value: string;
} & BaseExpression<ExpressionKind.StyleDeclaration>;

export type Override = {
  target: string[];
  constructorValue?: OverrideConstructorValue;
  body?: OverrideBodyExpression[];
} & BaseExpression<ExpressionKind.Override>;

export type OverrideConstructorValue = Parameter[] | string;

export type OverrideBodyExpression = Style | Variant;

export type Element = {
  children: ElementChild[];
  tagName: ElementName;
  name?: string;
  parameters: Parameter[];
} & BaseExpression<ExpressionKind.Element>;

export type ElementName = {
  name: string;
  namespace?: string;
};

export type Fragment = {
  children: Node[];
} & BaseExpression<ExpressionKind.Fragment>;

export type Text = {
  name?: string;
  value: string;
  children: TextChild[];
} & BaseExpression<ExpressionKind.Text>;

export type TextChild = Style;

export type Variant = {
  name: string;
  parameters: Parameter[];
} & BaseExpression<ExpressionKind.Variant>;

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
export type DocumentExpression = Node | Component | Style | Import | ValueToken;
export type BodyExpression = Component | Node;
