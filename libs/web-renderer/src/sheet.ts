import * as css from "@paperclip-ui/proto/lib/generated/virt/css";

// import * as url from "url";

export type StringifySheetOptions = {
  resolveUrl?: (url: string) => string;
  uri?: string;
};

export const stringifyCSSSheet = (
  sheet,
  options: StringifySheetOptions = {}
) => {
  return sheet.rules
    .map((rule) => stringifyCSSRule(rule, options))
    .join("\n\n");
};

export const stringifyCSSRule = (
  rule: css.Rule,
  options: StringifySheetOptions = {}
) => {
  if (rule.fontFace) {
    return stringifyFontFaceRule(rule.fontFace, options);
  }
  if (rule.keyframesRule) {
    return stringifyKeyframesRule(rule.keyframesRule, options);
  }
  if (rule.media) {
    return stringifyConditionRule(rule.media, options);
  }
  if (rule.page) {
    return stringifyConditionRule(rule.page, options);
  }
  if (rule.supports) {
    return stringifyConditionRule(rule.supports, options);
  }
  if (rule.style) {
    return stringifyStyleRule(rule.style, options);
  }
  throw new Error(`Unable to stringify rule`);
};

const stringifyConditionRule = (
  { name, conditionText, rules }: css.ConditionRule,
  options: StringifySheetOptions
) => {
  return `@${name} ${conditionText} {\n${rules
    .map((style) => stringifyCSSRule(style, options))
    .join("\n")}\n}`;
};

const stringifyKeyframesRule = (
  { name, rules }: css.KeyframesRule,
  options: StringifySheetOptions
) => {
  return `@keyframes ${name} {\n${rules
    .map((style) => stringifyKeyframeRule(style, options))
    .join("\n")}\n}`;
};

const stringifyKeyframeRule = (
  { key, style }: css.KeyframeRule,
  options: StringifySheetOptions
) => {
  return `${key} {\n${style
    .map((style) => stringifyStyle(style, options))
    .join("\n")}\n}`;
};

const stringifyFontFaceRule = (
  { style }: css.FontFaceRule,
  options: StringifySheetOptions
) => {
  return `@font-face {\n${style
    .map((style) => stringifyStyle(style, options))
    .join("\n")}\n}`;
};

const stringifyStyleRule = (
  { selectorText, style, ...rest }: css.StyleRule,
  options: StringifySheetOptions
) => {
  return `${selectorText} {\n${style
    .map((style) => stringifyStyle(style, options))
    .join("\n")}\n}`;
};

const stringifyStyle = (
  { name, value }: css.StyleDeclaration,
  { uri, resolveUrl }: StringifySheetOptions
) => {
  if (value) {
    // required for bundling, otherwise file protocol is maintained
    // if (uri) {
    //   const urls = value.match(/(file:\/\/.*?)(?=['")])/g) || [];
    //   const selfPathname = url.fileURLToPath(uri);
    //   for (const foundUrl of urls) {
    //     const pathname = url.fileURLToPath(foundUrl);
    //     let relativePath = path.relative(path.dirname(selfPathname), pathname);
    //     if (relativePath.charAt(0) !== ".") {
    //       relativePath = "./" + relativePath;
    //     }

    //     value = value.replace(foundUrl, relativePath);
    //   }
    // }

    if (value && resolveUrl) {
      if (value.includes("file:")) {
        const url = value.match(/(file:\/\/[^)]+)/)[1];
        value = value.replace(url, resolveUrl(url));
      } else if (value.includes("url(")) {
        const parts = value.match(/url\(['"]?(.*?)['"]?\)/);
        const url = parts && parts[1];
        if (url && !url.includes("http")) {
          value = value.replace(url, resolveUrl(url));
        }
      }
    }
  }

  return `  ${name.trim()}:${value};`;
};
