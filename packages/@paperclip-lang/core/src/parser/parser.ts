import {
  BaseExpression,
  BodyExpression,
  Component,
  ComponentBodyExpression,
  Document,
  DocumentExpression,
  Element,
  ElementChild,
  ExpressionKind,
  Node,
  Parameter,
  Render,
  Text,
  Variant,
  VisibleNode,
} from "./ast";
import { UnexpectedTokenError } from "./errors";
import { token, Tokenizer, TokenKind } from "./tokenizer";

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

  if (curr.kind === TokenKind.Keyword) {
    return parseComponent(context);
  }

  throw new UnexpectedTokenError(curr.value);
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
      expressions.push(parseBodyExpression(context));
    }

    context.tokenizer.currValue(TokenKind.CurlyClose);
    context.tokenizer.next(); // eat }

    return expressions;
  };

const parseComponentBody = bodyParser<ComponentBodyExpression>((context) => {
  context.tokenizer.eatWhitespace();
  const keyword = context.tokenizer.curr();
  if (keyword.value === "variant") {
    return parseVariant(context);
  } else if (keyword.value === "render") {
    return parseRender(context);
  }

  throw new UnexpectedTokenError(keyword.value);
  return null;
});

const parseNodeChildren = bodyParser<ElementChild>((context) => {
  return parseNode(context);
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
  context.tokenizer.nextEatWhitespace(); // eat (
  while (!context.tokenizer.isEOF()) {
    const name = context.tokenizer.currValue(TokenKind.Keyword);
    console.log(context.tokenizer.curr(), "S");
    context.tokenizer.nextEatWhitespace();
    context.tokenizer.currValue(TokenKind.Colon);
    context.tokenizer.nextEatWhitespace();
    const value = context.tokenizer.currValue(TokenKind.Keyword);
    context.tokenizer.nextEatWhitespace();
    const fin = context.tokenizer.curr();
    context.tokenizer.next();
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

  return null;
};

const parseText = (context: Context, before: string): Text => {
  context.tokenizer.next(); // eat text
  const value = context.tokenizer.curr();
  const after = context.tokenizer.next().value;
  return {
    raws: { before, after },
    kind: ExpressionKind.Text,
    value: value.value,
  };
};

const parseElement = (context: Context): Element => {
  const name = context.tokenizer.curr();
  let next = context.tokenizer.nextEatWhitespace();
  let children: ElementChild[] = [];
  if (next.kind === TokenKind.CurlyOpen) {
    children = parseNodeChildren(context);
  }
  context.tokenizer.eatWhitespace();

  return {
    raws: {},
    name: name.value,
    kind: ExpressionKind.Element,
    parameters: [],
    children,
  };
};
