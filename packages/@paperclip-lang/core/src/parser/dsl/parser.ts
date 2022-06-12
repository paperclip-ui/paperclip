import { centerTransformZoom, EMPTY_ARRAY } from "tandem-common";
import {
  BaseExpression,
  Component,
  ComponentBodyExpression,
  Document,
  DocumentExpression,
  Element,
  ElementChild,
  ElementName,
  ExpressionKind,
  Import,
  Node,
  Override,
  OverrideBodyExpression,
  OverrideConstructorValue,
  Parameter,
  Render,
  Style,
  StyleBodyExpression,
  StyleCondition,
  StyleDeclaration,
  Text,
  TextChild,
  ValueToken,
  Variant,
} from "./ast";
import { UnexpectedTokenError } from "../base/errors";
import {
  Token,
  DSLTokenizer,
  DSLTokenKind,
  DSL_SUPERFLUOUS_TOKENS,
} from "./tokenizer";
import { isDocComment, parseDocComment } from "../docco/parser";
import { DocComment } from "../docco/ast";
import { StringScanner } from "../base/string-scanner";

type Context = {
  tokenizer: DSLTokenizer;
};

export const parseDocument = (source: string): Document => {
  const tokenizer = new DSLTokenizer(new StringScanner(source));

  // setup current token
  tokenizer.next();

  const context: Context = { tokenizer };
  const expressions = parseDocumentExpressions(context);
  const after = tokenizer.eat(DSL_SUPERFLUOUS_TOKENS);

  return {
    kind: ExpressionKind.Document,
    raws: { after },
    expressions,
  };
};

const parseDocumentExpressions = (context: Context) => {
  const expressions: DocumentExpression[] = [];
  while (!context.tokenizer.isEOF()) {
    context.tokenizer.eat(
      DSLTokenKind.Whitespace | DSLTokenKind.SingleLineComment
    );
    expressions.push(parseDocumentExpression(context));
  }
  return expressions;
};

const parseDocumentExpression = (context: Context): DocumentExpression => {
  let curr = context.tokenizer.curr();
  let docComment: DocComment;
  let isPublic: boolean;

  if (curr.kind === DSLTokenKind.MultiLineComment) {
    if (isDocComment(curr.value)) {
      docComment = parseDocComment(curr.value);
    }
    curr = context.tokenizer.nextEat(DSLTokenKind.Whitespace);
  }

  if (curr.value === "public") {
    isPublic = true;
    curr = context.tokenizer.nextEat(DSLTokenKind.Whitespace);
  }

  if (curr.value === "component") {
    return parseComponent(context, docComment, isPublic);
  } else if (isStyleToken(curr)) {
    return parseStyle(context, isPublic);
  } else if (curr.value === "import") {
    return parseImport(context);
  } else if (curr.value === "token") {
    return parseToken(context, isPublic);
  }

  return parseNode(context);
};

const parseToken = (
  context: Context,
  isPublic: boolean = false
): ValueToken => {
  const { value: name } = context.tokenizer.nextEat(DSL_SUPERFLUOUS_TOKENS);
  const value = parseStyleDeclarationValue(context);
  return {
    isPublic,
    raws: {},
    kind: ExpressionKind.Token,
    name,
    value,
  };
};

const parseImport = (context: Context): Import => {
  context.tokenizer.currValue(DSLTokenKind.Keyword);
  context.tokenizer.nextEat(DSL_SUPERFLUOUS_TOKENS);
  const path = context.tokenizer.currValue(DSLTokenKind.String);
  context.tokenizer.nextEat(DSL_SUPERFLUOUS_TOKENS);
  context.tokenizer.currValue(DSLTokenKind.Keyword);
  context.tokenizer.nextEat(DSL_SUPERFLUOUS_TOKENS);
  const namespace = context.tokenizer.currValue(DSLTokenKind.Keyword);
  context.tokenizer.nextEat(DSL_SUPERFLUOUS_TOKENS);
  return {
    raws: {},
    kind: ExpressionKind.Import,
    namespace,
    path,
  };
};

const parseComponent = (
  context: Context,
  docComment: DocComment,
  isPublic?: boolean
): Component => {
  const before = context.tokenizer.eat(DSL_SUPERFLUOUS_TOKENS);
  context.tokenizer.next(); // eat component
  context.tokenizer.eat(DSL_SUPERFLUOUS_TOKENS);
  const name = context.tokenizer.currValue(DSLTokenKind.Keyword);
  context.tokenizer.next(); // eat keyword
  context.tokenizer.eat(DSL_SUPERFLUOUS_TOKENS);
  const body = parseComponentBody(context);

  const after = context.tokenizer.eat(DSL_SUPERFLUOUS_TOKENS);

  return {
    kind: ExpressionKind.Component,
    name,
    docComment,
    isPublic,
    raws: { before, after },
    body,
  };
};

const bodyParser =
  <TBodyExpression extends BaseExpression<any>>(
    parseBodyExpression: (context: Context) => TBodyExpression | null
  ) =>
  (context: Context): TBodyExpression[] => {
    context.tokenizer.currValue(DSLTokenKind.CurlyOpen);
    context.tokenizer.nextEat(DSL_SUPERFLUOUS_TOKENS); // eat {

    const expressions = [];

    while (
      !context.tokenizer.isEOF() &&
      context.tokenizer.curr().kind !== DSLTokenKind.CurlyClose
    ) {
      context.tokenizer.eat(DSL_SUPERFLUOUS_TOKENS);
      const curr = context.tokenizer.curr();
      const expr = parseBodyExpression(context);
      if (!expr) {
        throw new UnexpectedTokenError(curr.value);
      }
      expressions.push(expr);
    }

    context.tokenizer.currValue(DSLTokenKind.CurlyClose);
    context.tokenizer.next(); // eat }

    return expressions;
  };

const parseArray = (context: Context) => {
  const items: any[] = [];
  context.tokenizer.currValue(DSLTokenKind.SquareOpen);
  context.tokenizer.nextEat(DSL_SUPERFLUOUS_TOKENS);
  context.tokenizer.currValue(DSLTokenKind.SquareClose);
  context.tokenizer.nextEat(DSL_SUPERFLUOUS_TOKENS);
  return items;
};

const parseComponentBody = bodyParser<ComponentBodyExpression>((context) => {
  const keyword = context.tokenizer.curr();
  if (keyword.value === "variant") {
    return parseVariant(context);
  } else if (keyword.value === "render") {
    return parseRender(context);
  }
});

const parseVariant = (context: Context): Variant => {
  context.tokenizer.next(); // eat variant
  const name = context.tokenizer.nextEat(DSL_SUPERFLUOUS_TOKENS);
  context.tokenizer.nextEat(DSL_SUPERFLUOUS_TOKENS); // eat name
  let parameters: Parameter[] = [];
  if (context.tokenizer.curr().kind === DSLTokenKind.ParenOpen) {
    parameters = parseParameters(context);
  }
  context.tokenizer.eat(DSL_SUPERFLUOUS_TOKENS);

  return {
    raws: {},
    name: name.value,
    parameters,
    kind: ExpressionKind.Variant,
  };
};

export const parseParameters = (context: Context): Parameter[] => {
  const parameters = [];
  context.tokenizer.nextEat(DSL_SUPERFLUOUS_TOKENS);
  while (!context.tokenizer.isEOF()) {
    const fin = context.tokenizer.curr();
    context.tokenizer.next();
    context.tokenizer.eat(DSL_SUPERFLUOUS_TOKENS);
    if (fin.kind === DSLTokenKind.ParenClose) {
      break;
    }
  }
  return parameters;
};

const parseParameter = (context: Context) => {
  const name = context.tokenizer.currValue(DSLTokenKind.Keyword);
  context.tokenizer.nextEat(DSL_SUPERFLUOUS_TOKENS);
  context.tokenizer.currValue(DSLTokenKind.Colon);
  context.tokenizer.nextEat(DSL_SUPERFLUOUS_TOKENS);

  // TODO - handle array
  const value = context.tokenizer.currValue(
    DSLTokenKind.Keyword | DSLTokenKind.String | DSLTokenKind.Number
  );
  context.tokenizer.nextEat(DSL_SUPERFLUOUS_TOKENS);
};

const parseRender = (context: Context): Render => {
  context.tokenizer.next(); // eat render
  context.tokenizer.eat(DSL_SUPERFLUOUS_TOKENS);
  const node = parseNode(context);
  context.tokenizer.eat(DSL_SUPERFLUOUS_TOKENS);

  return {
    raws: {},
    kind: ExpressionKind.Render,
    node,
  };
};

const parseNode = (context: Context) => {
  const before = context.tokenizer.eat(DSL_SUPERFLUOUS_TOKENS);
  const keyword = context.tokenizer.curr();
  if (keyword.value === "text") {
    return parseText(context, before);
  } else {
    return parseElement(context);
  }
};

const parseText = (context: Context, before: string): Text => {
  context.tokenizer.nextEat(DSL_SUPERFLUOUS_TOKENS); // eat text
  const value = context.tokenizer.curr();
  let children: TextChild[] = EMPTY_ARRAY;
  const next = context.tokenizer.nextEat(DSL_SUPERFLUOUS_TOKENS);
  if (next.kind === DSLTokenKind.CurlyOpen) {
    children = parseTextChildren(context);
  }
  return {
    raws: { before, after: "" },
    kind: ExpressionKind.Text,
    value: value.value,
    children,
  };
};

const parseTextChildren = bodyParser<TextChild>((context) => {
  const keyword = context.tokenizer.curr();
  if (isStyleToken(keyword)) {
    return parseStyle(context);
  }
});

const parseStyle = (context: Context, isPublic?: boolean): Style => {
  context.tokenizer.currValue(DSLTokenKind.Keyword);
  const next = context.tokenizer.nextEat(DSL_SUPERFLUOUS_TOKENS); // eat keyword
  let name: string;
  if (next.kind === DSLTokenKind.Keyword) {
    name = next.value;
    context.tokenizer.nextEat(DSL_SUPERFLUOUS_TOKENS);
  }
  context.tokenizer.currValue(DSLTokenKind.CurlyOpen);
  const body = parseStyleBody(context);
  context.tokenizer.eat(DSL_SUPERFLUOUS_TOKENS);

  return {
    kind: ExpressionKind.Style,
    name,
    isPublic,
    raws: {},
    body,
  };
};

const parseStyleBody = bodyParser<StyleBodyExpression>((context: Context) => {
  const keyword = context.tokenizer.curr();
  if (keyword.value === "if") {
    return parseStyleCondition(context);
  }
  return parseStyleDeclaration(context);
});

const parseStyleCondition = (context: Context): StyleCondition => {
  context.tokenizer.currValue(DSLTokenKind.Keyword);
  context.tokenizer.nextEat(DSL_SUPERFLUOUS_TOKENS);
  const conditionName = context.tokenizer.currValue(DSLTokenKind.Keyword);
  context.tokenizer.nextEat(DSL_SUPERFLUOUS_TOKENS);
  const body = parseStyleBody(context);
  context.tokenizer.eat(DSL_SUPERFLUOUS_TOKENS);

  return {
    kind: ExpressionKind.StyleCondition,
    conditionName,
    raws: {},
    body,
  };
};

const parseStyleDeclaration = (context: Context): StyleDeclaration => {
  let name: string = "";
  while (context.tokenizer.curr().kind !== DSLTokenKind.Colon) {
    name += context.tokenizer.curr().value;
    context.tokenizer.next();
  }

  context.tokenizer.eat(DSL_SUPERFLUOUS_TOKENS);
  context.tokenizer.currValue(DSLTokenKind.Colon);
  context.tokenizer.nextEat(DSL_SUPERFLUOUS_TOKENS);

  const value = parseStyleDeclarationValue(context);

  return {
    kind: ExpressionKind.StyleDeclaration,
    raws: {},
    name,
    value,
  };
};

const parseStyleDeclarationValue = (context: Context) => {
  let value = "";
  while (!context.tokenizer.curr().value.includes("\n")) {
    value += context.tokenizer.curr().value;
    context.tokenizer.next();
  }
  context.tokenizer.nextEat(DSL_SUPERFLUOUS_TOKENS);
  return value;
};

const parseElementName = (context: Context): ElementName => {
  const [name, namespace] = parseRef(context);
  return { name, namespace };
};

const parseElement = (context: Context): Element => {
  const tagName = parseElementName(context);
  let name: string;
  let next = context.tokenizer.curr();
  let children: ElementChild[] = EMPTY_ARRAY;
  let parameters: Parameter[] = EMPTY_ARRAY;
  if (next.kind === DSLTokenKind.Keyword) {
    name = next.value;
    next = context.tokenizer.nextEat(DSL_SUPERFLUOUS_TOKENS);
  }

  if (next?.kind === DSLTokenKind.ParenOpen) {
    parameters = parseParameters(context);
    next = context.tokenizer.curr();
  }

  if (next?.kind === DSLTokenKind.CurlyOpen) {
    children = parseElementChildren(context);
  }

  context.tokenizer.eat(DSL_SUPERFLUOUS_TOKENS);

  return {
    raws: {},
    name,
    tagName,
    kind: ExpressionKind.Element,
    parameters,
    children,
  };
};

const parseElementChildren = bodyParser<ElementChild>((context) => {
  const curr = context.tokenizer.curr();
  if (isStyleToken(curr)) {
    return parseStyle(context);
  } else if (curr.value === "override") {
    return parseOverride(context);
  }
  return parseNode(context);
});

const parseRef = (context: Context): string[] => {
  const name = context.tokenizer.curr().value;
  let next = context.tokenizer.nextEat(DSL_SUPERFLUOUS_TOKENS);
  const parts: string[] = [name];
  while (next.kind === DSLTokenKind.Dot) {
    parts.push(context.tokenizer.nextEat(DSL_SUPERFLUOUS_TOKENS).value);
    next = context.tokenizer.nextEat(DSL_SUPERFLUOUS_TOKENS); // queue dot
  }

  return parts;
};

const parseOverride = (context: Context): Override => {
  context.tokenizer.nextEat(DSL_SUPERFLUOUS_TOKENS); // eat override + ws
  let curr = context.tokenizer.curr();
  const target = curr.kind === DSLTokenKind.Keyword ? parseRef(context) : null;
  let constructorValue: OverrideConstructorValue;
  curr = context.tokenizer.curr();
  if (curr.kind === DSLTokenKind.ParenOpen) {
    constructorValue = parseParameters(context);
  } else if (curr.kind === DSLTokenKind.String) {
    constructorValue = curr.value;
    context.tokenizer.nextEat(DSL_SUPERFLUOUS_TOKENS);
  }
  let body: OverrideBodyExpression[];

  if (context.tokenizer.curr().kind === DSLTokenKind.CurlyOpen) {
    body = parseOverrideBody(context);
    context.tokenizer.eat(DSL_SUPERFLUOUS_TOKENS);
  }

  return {
    kind: ExpressionKind.Override,
    raws: {},
    target,
    constructorValue,
    body,
  };
};

const parseOverrideBody = bodyParser<OverrideBodyExpression>((context) => {
  const curr = context.tokenizer.curr();
  if (isStyleToken(curr)) {
    return parseStyle(context);
  } else if (curr.value === "variant") {
    return parseVariant(context);
  }
});

const isStyleToken = (token: Token) => token.value === "style";
