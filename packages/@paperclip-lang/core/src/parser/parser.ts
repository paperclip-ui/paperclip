import {
  BaseExpression,
  BodyExpression,
  Component,
  ComponentBody,
  Document,
  DocumentExpression,
  ExpressionKind,
  Node,
  Render,
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
    console.log(context);
    expressions.push(parseDocumentExpression(context));
    context.tokenizer.next();
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
    parseBodyExpression: (context: Context) => TBodyExpression
  ) =>
  (context: Context): TBodyExpression[] => {
    context.tokenizer.currValue(TokenKind.CurlyOpen);
    context.tokenizer.next(); // eat {

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

const parseComponentBody = bodyParser<ComponentBody>((context) => {
  return parseRender(context);
});

const parseRender = (context: Context): Render => {
  context.tokenizer.next(); // eat

  return {
    kind: ExpressionKind.Render,
    node: parseNode(context),
  };
};

const parseNode = (context: Context) => {
  const before = context.tokenizer.eatWhitespace();
  // const name = context.tokenizer.
  const after = context.tokenizer.eatWhitespace();

  return null;
};
