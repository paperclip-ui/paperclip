export enum DocCommentExpressionKind {
  Comment = "Comment",
  CommentProperty = "CommentProperty",
  CommentParameters = "CommentParameters",
  CommentParameter = "CommentParameter",
  Text = "Text",
  Number = "Number",
}

export type BaseDocCommentExpression<TKind extends DocCommentExpressionKind> = {
  kind: TKind;
  id: string;
};

export type DocComment = {
  description: string;
  properties: DocCommentProperty[];
} & BaseDocCommentExpression<DocCommentExpressionKind.Comment>;

export type DocCommentProperty = {
  name: string;
  value: DocCommentPropertyValue;
} & BaseDocCommentExpression<DocCommentExpressionKind.CommentProperty>;

export type DocCommentParameters = {
  values: DocCommentParameter[];
} & BaseDocCommentExpression<DocCommentExpressionKind.CommentParameters>;

export type DocCommentParameter = {
  name: string;
  value: DocCommentParameterValue;
} & BaseDocCommentExpression<DocCommentExpressionKind.CommentParameter>;

export type DocCommentParameterValue = DocCommentText | DocCommentNumber;

export type DocCommentText = {
  value: string;
} & BaseDocCommentExpression<DocCommentExpressionKind.Text>;

export type DocCommentNumber = {
  value: string;
} & BaseDocCommentExpression<DocCommentExpressionKind.Number>;

export type DocCommentPropertyValue = DocCommentParameters | DocCommentText;
