import * as css from "@paperclip-ui/proto/lib/virt/css_pb";

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
  rule: css.Rule.AsObject,
  options: StringifySheetOptions = {}
) => {
  if (rule.fontface) {
    return stringifyFontFaceRule(rule.fontface, options);
  }
  if (rule.keyframesrule) {
    return stringifyKeyframesRule(rule.keyframesrule, options);
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
  { name, conditionText, rulesList }: css.ConditionRule.AsObject,
  options: StringifySheetOptions
) => {
  return `@${name} ${conditionText} {\n${rulesList
    .map((style) => stringifyCSSRule(style, options))
    .join("\n")}\n}`;
};

const stringifyKeyframesRule = (
  { name, rulesList }: css.KeyframesRule.AsObject,
  options: StringifySheetOptions
) => {
  return `@keyframes ${name} {\n${rulesList
    .map((style) => stringifyKeyframeRule(style, options))
    .join("\n")}\n}`;
};

const stringifyKeyframeRule = (
  { key, styleList }: css.KeyframeRule.AsObject,
  options: StringifySheetOptions
) => {
  return `${key} {\n${styleList
    .map((style) => stringifyStyle(style, options))
    .join("\n")}\n}`;
};

const stringifyFontFaceRule = (
  { styleList }: css.FontFaceRule.AsObject,
  options: StringifySheetOptions
) => {
  return `@font-face {\n${styleList
    .map((style) => stringifyStyle(style, options))
    .join("\n")}\n}`;
};

const stringifyStyleRule = (
  { selectorText, styleList, ...rest }: css.StyleRule.AsObject,
  options: StringifySheetOptions
) => {
  return `${selectorText} {\n${styleList
    .map((style) => stringifyStyle(style, options))
    .join("\n")}\n}`;
};

const stringifyStyle = (
  { name, value }: css.StyleDeclaration.AsObject,
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
