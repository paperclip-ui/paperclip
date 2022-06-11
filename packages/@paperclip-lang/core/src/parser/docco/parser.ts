import {
  DocComment,
  DocCommentExpressionKind,
  DocCommentParameter,
  DocCommentParameters,
  DocCommentParameterValue,
  DocCommentProperty,
  DocCommentPropertyValue,
  DocCommentText,
} from "./ast";
import {
  DoccoTokenizer,
  DoccoTokenKind,
  DOCCO_SUPERFLUOUS_TOKEN_KIND,
} from "./tokenizer";
import { parseParameters as parseDSLParameters } from "../dsl/parser";
import { DSLTokenizer } from "../dsl/tokenizer";
import { StringScanner } from "../base/string-scanner";

type Context = {
  tokenizer: DoccoTokenizer;
};

export const isDocComment = (value: string) => value.substring(0, 3) === "/**";

export const parseDocComment = (value: string): DocComment => {
  const context = {
    tokenizer: new DoccoTokenizer(
      new StringScanner(value.substring(3, value.length - 3))
    ),
  };
  context.tokenizer.next();
  const description = parseTextValue(context, DoccoTokenKind.At);
  const properties = parseProperties(context);
  return {
    kind: DocCommentExpressionKind.Comment,
    description,
    properties,
  };
};

const parseTextValue = (context: Context, terminal: number) => {
  let buffer = "";

  while (
    !context.tokenizer.isEOF() &&
    !(context.tokenizer.curr().kind & terminal)
  ) {
    buffer += context.tokenizer.curr().value;
    context.tokenizer.next();
  }

  return buffer.replace(/\n\s+\*/g, "");
};

const parseProperties = (context: Context): DocCommentProperty[] => {
  const properties = [];

  while (!context.tokenizer.isEOF()) {
    const curr = context.tokenizer.curr();
    if (curr.kind === DoccoTokenKind.At) {
      properties.push(parseProperty(context));
    } else {
      context.tokenizer.next();
    }
  }

  return properties;
};

const parseProperty = (context: Context): DocCommentProperty => {
  context.tokenizer.next();
  const { value: name } = context.tokenizer.curr();
  context.tokenizer.nextEat(DoccoTokenKind.Whitespace);
  const value = parsePropertyValue(context);
  return {
    kind: DocCommentExpressionKind.CommentProperty,
    name,
    value,
  };
};

const parsePropertyValue = (context: Context): DocCommentPropertyValue => {
  const curr = context.tokenizer.curr();
  if (curr.kind === DoccoTokenKind.ParenOpen) {
    return parseParameters(context);
  }
  return parseParamText(context);
};

const parseParameters = (context: Context): DocCommentParameters => {
  context.tokenizer.next(); // eat (,
  const values: DocCommentParameter[] = [];

  while (!(context.tokenizer.curr().kind & DoccoTokenKind.ParenClose)) {
    values.push(parseParameter(context));
    if (context.tokenizer.curr().kind & DoccoTokenKind.Comma) {
      context.tokenizer.nextEat(DOCCO_SUPERFLUOUS_TOKEN_KIND); //
    }
  }

  return {
    kind: DocCommentExpressionKind.CommentParameters,
    values,
  };
};

const parseParameter = (context: Context): DocCommentParameter => {
  const { value: name } = context.tokenizer.curr();
  context.tokenizer.nextEat(DOCCO_SUPERFLUOUS_TOKEN_KIND); // eat name
  context.tokenizer.nextEat(DOCCO_SUPERFLUOUS_TOKEN_KIND); // eat :
  const value = parseParameterValue(context);
  return {
    kind: DocCommentExpressionKind.CommentParameter,
    name,
    value,
  };
};

const parseParameterValue = (context: Context): DocCommentParameterValue => {
  const curr = context.tokenizer.curr();

  if (curr.kind === DoccoTokenKind.Number) {
    context.tokenizer.nextEat(DOCCO_SUPERFLUOUS_TOKEN_KIND);
    return { kind: DocCommentExpressionKind.Number, value: curr.value };
  } else {
    return {
      kind: DocCommentExpressionKind.Text,
      value: parseTextValue(context, DoccoTokenKind.Comma),
    };
  }
};

const parseParamText = (context: Context): DocCommentText => {
  let value = parseTextValue(context, DoccoTokenKind.At);

  return {
    kind: DocCommentExpressionKind.Text,
    value,
  };
};
