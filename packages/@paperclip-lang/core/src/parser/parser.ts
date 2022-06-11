import { EMPTY_ARRAY } from "tandem-common";
import { runInNewContext } from "vm";
import {
  BaseExpression,
  BodyExpression,
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
  Variant,
  VisibleNode,
} from "./ast";
import { UnexpectedTokenError } from "./errors";
import { Token, token, Tokenizer, TokenKind } from "./tokenizer";

type Context = {
  tokenizer: Tokenizer;
};

export const parseDocument = (source: string): Document => {
  const tokenizer = new Tokenizer(source);

  // setup current token
  tokenizer.next();

  const context: Context = { tokenizer };
  const before = tokenizer.eatWhitespace();

  const expressions = parseDocumentExpressions(context);
  const after = tokenizer.eatWhitespace();

  return {
    kind: ExpressionKind.Document,
    raws: { before, after },
    expressions,
  };
};

const parseDocumentExpressions = (context: Context) => {
  const expressions: DocumentExpression[] = [];
  while (!context.tokenizer.isEOF()) {
    expressions.push(parseDocumentExpression(context));
  }
  return expressions;
};

const parseDocumentExpression = (context: Context): DocumentExpression => {
  const curr = context.tokenizer.curr();

  if (curr.value === "component") {
    return parseComponent(context);
  } else if (isStyleToken(curr)) {
    return parseStyle(context);
  } else if (curr.value === "import") {
    return parseImport(context);
  }

  throw new UnexpectedTokenError(curr.value);
};

const parseImport = (context: Context): Import => {
  context.tokenizer.currValue(TokenKind.Keyword);
  context.tokenizer.nextEatWhitespace();
  const path = context.tokenizer.currValue(TokenKind.String);
  context.tokenizer.nextEatWhitespace();
  context.tokenizer.currValue(TokenKind.Keyword);
  context.tokenizer.nextEatWhitespace();
  const namespace = context.tokenizer.currValue(TokenKind.Keyword);
  context.tokenizer.nextEatWhitespace();
  return {
    raws: {},
    kind: ExpressionKind.Import,
    namespace,
    path,
  };
};

const parseComponent = (context: Context): Component => {
  const before = context.tokenizer.eatWhitespace();
  context.tokenizer.next(); // eat component
  context.tokenizer.eatWhitespace();
  const name = context.tokenizer.currValue(TokenKind.Keyword);
  context.tokenizer.next(); // eat keyword
  context.tokenizer.eatWhitespace();
  const body = parseComponentBody(context);

  const after = context.tokenizer.eatWhitespace();

  return {
    kind: ExpressionKind.Component,
    name,
    raws: { before, after },
    body,
  };
};

const bodyParser =
  <TBodyExpression extends BaseExpression<any>>(
    parseBodyExpression: (context: Context) => TBodyExpression | null
  ) =>
  (context: Context): TBodyExpression[] => {
    context.tokenizer.currValue(TokenKind.CurlyOpen);
    context.tokenizer.nextEatWhitespace(); // eat {

    const expressions = [];

    while (
      !context.tokenizer.isEOF() &&
      context.tokenizer.curr().kind !== TokenKind.CurlyClose
    ) {
      context.tokenizer.eatWhitespace();
      const curr = context.tokenizer.curr();
      const expr = parseBodyExpression(context);
      if (!expr) {
        throw new UnexpectedTokenError(curr.value);
      }
      expressions.push(expr);
    }

    context.tokenizer.currValue(TokenKind.CurlyClose);
    context.tokenizer.next(); // eat }

    return expressions;
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
  const name = context.tokenizer.nextEatWhitespace();
  context.tokenizer.nextEatWhitespace(); // eat name
  let parameters: Parameter[] = [];
  if (context.tokenizer.curr().kind === TokenKind.ParenOpen) {
    parameters = parseParameters(context);
  }
  context.tokenizer.eatWhitespace();

  return {
    raws: {},
    name: name.value,
    parameters,
    kind: ExpressionKind.Variant,
  };
};

const parseParameters = (context: Context) => {
  const parameters = [];
  context.tokenizer.nextEatWhitespace();
  while (!context.tokenizer.isEOF()) {
    const name = context.tokenizer.currValue(TokenKind.Keyword);
    context.tokenizer.nextEatWhitespace();
    context.tokenizer.currValue(TokenKind.Colon);
    context.tokenizer.nextEatWhitespace();
    const value = context.tokenizer.currValue(
      TokenKind.Keyword,
      TokenKind.String,
      TokenKind.Number
    );
    context.tokenizer.nextEatWhitespace();
    const fin = context.tokenizer.curr();
    context.tokenizer.next();
    context.tokenizer.eatWhitespace();
    if (fin.kind === TokenKind.ParenClose) {
      break;
    }
  }
  return parameters;
};

const parseRender = (context: Context): Render => {
  context.tokenizer.next(); // eat render
  const before = context.tokenizer.eatWhitespace();
  const node = parseNode(context);
  const after = context.tokenizer.eatWhitespace();

  return {
    raws: { before, after },
    kind: ExpressionKind.Render,
    node,
  };
};

const parseNode = (context: Context) => {
  const before = context.tokenizer.eatWhitespace();
  const keyword = context.tokenizer.curr();
  if (keyword.value === "text") {
    return parseText(context, before);
  } else {
    return parseElement(context);
  }
};

const parseText = (context: Context, before: string): Text => {
  context.tokenizer.nextEatWhitespace(); // eat text
  const value = context.tokenizer.curr();
  let children: TextChild[] = EMPTY_ARRAY;
  const next = context.tokenizer.nextEatWhitespace();
  if (next.kind === TokenKind.CurlyOpen) {
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

const parseStyle = (context: Context): Style => {
  context.tokenizer.currValue(TokenKind.Keyword);
  const next = context.tokenizer.nextEatWhitespace(); // eat keyword
  let name: string;
  if (next.kind === TokenKind.Keyword) {
    name = next.value;
    context.tokenizer.nextEatWhitespace();
  }
  context.tokenizer.currValue(TokenKind.CurlyOpen);
  const body = parseStyleBody(context);
  context.tokenizer.eatWhitespace();

  return {
    kind: ExpressionKind.Style,
    name,
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
  context.tokenizer.currValue(TokenKind.Keyword);
  context.tokenizer.nextEatWhitespace();
  const conditionName = context.tokenizer.currValue(TokenKind.Keyword);
  context.tokenizer.nextEatWhitespace();
  const body = parseStyleBody(context);
  context.tokenizer.eatWhitespace();

  return {
    kind: ExpressionKind.StyleCondition,
    conditionName,
    raws: {},
    body,
  };
};

const parseStyleDeclaration = (context: Context): StyleDeclaration => {
  const name = context.tokenizer.currValue(TokenKind.Keyword);
  context.tokenizer.nextEatWhitespace();
  context.tokenizer.currValue(TokenKind.Colon);
  context.tokenizer.nextEatWhitespace();
  const value = context.tokenizer.currValue(TokenKind.Keyword);
  context.tokenizer.nextEatWhitespace();

  return {
    kind: ExpressionKind.StyleDeclaration,
    raws: {},
    name,
    value,
  };
};

const parseElementName = (context: Context): ElementName => {
  const [name, namespace] = parseRef(context);
  return { name, namespace };
};

const parseElement = (context: Context): Element => {
  const name = parseElementName(context);
  let next = context.tokenizer.curr();
  let children: ElementChild[] = EMPTY_ARRAY;
  let parameters: Parameter[] = EMPTY_ARRAY;
  if (next.kind === TokenKind.ParenOpen) {
    parameters = parseParameters(context);
    next = context.tokenizer.curr();
  }

  if (next.kind === TokenKind.CurlyOpen) {
    children = parseElementChildren(context);
  }
  context.tokenizer.eatWhitespace();

  return {
    raws: {},
    name,
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
  let next = context.tokenizer.nextEatWhitespace();
  const parts: string[] = [name];
  while (next.kind === TokenKind.Dot) {
    parts.push(context.tokenizer.nextEatWhitespace().value);
    next = context.tokenizer.nextEatWhitespace(); // queue dot
  }

  return parts;
};

const parseOverride = (context: Context): Override => {
  context.tokenizer.nextEatWhitespace(); // eat override + ws
  let curr = context.tokenizer.curr();
  const target = curr.kind === TokenKind.Keyword ? parseRef(context) : null;
  let constructorValue: OverrideConstructorValue;
  curr = context.tokenizer.curr();
  if (curr.kind === TokenKind.ParenOpen) {
    constructorValue = parseParameters(context);
  } else if (curr.kind === TokenKind.String) {
    constructorValue = curr.value;
    context.tokenizer.nextEatWhitespace();
  }
  const body = parseOverrideBody(context);
  context.tokenizer.eatWhitespace();
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
  }
});

const isStyleToken = (token: Token) => token.value === "style";
