// From https://github.com/microsoft/TypeScript-TmLanguage/blob/master/build/build.ts

import fs = require("fs");
import path = require("path");
import yaml = require("js-yaml");
import plist = require("plist");

enum Language {
  Paperclip = "paperclip-core",
  // PaperclipSyle = "paperclip-style",
}

enum Extension {
  YamlTmLanguage = "yaml",
  JsonTmLanguage = "tmLanguage.json",
}

class Test {
  private _ab: String;
}

function file(language: Language, extension: Extension) {
  return path.join(
    __dirname,
    "..",
    "..",
    "syntaxes",
    `${language}.${extension}`
  );
}

// function writePlistFile(grammar: TmGrammar | TmTheme, fileName: string) {
//     const text = plist.build(grammar);
//     // fs.writeFileSync(fileName, text);
// }

function writeJSONFile(grammar: TmGrammar | TmTheme, fileName: string) {
  const text = JSON.stringify(grammar, null, 2);
  fs.writeFileSync(fileName, text);
}

function readYaml(fileName: string) {
  const text = fs.readFileSync(fileName, "utf8");
  return yaml.load(text);
}

// function changeTsToTsx(str: string) {
//     return str.replace(/\.ts/g, '.tsx');
// }

function transformGrammarRule(
  rule: any,
  propertyNames: string[],
  transformProperty: (ruleProperty: string) => string
) {
  for (const propertyName of propertyNames) {
    const value = rule[propertyName];
    if (typeof value === "string") {
      rule[propertyName] = transformProperty(value);
    }
  }

  for (const propertyName in rule) {
    const value = rule[propertyName];
    if (typeof value === "object") {
      transformGrammarRule(value, propertyNames, transformProperty);
    }
  }
}

function transformGrammarRepository(
  grammar: TmGrammar,
  propertyNames: string[],
  transformProperty: (ruleProperty: string) => string
) {
  const repository = grammar.repository;
  for (const key in repository) {
    transformGrammarRule(repository[key], propertyNames, transformProperty);
  }
}

// function getTsxGrammar() {
//     let variables: MapLike<string>;
//     const tsxUpdatesBeforeTransformation = readYaml(file(Language., Extension.YamlTmLanguage)) as TmGrammar;
//     const grammar = getTsGrammar(tsGrammarVariables => {
//         variables = tsGrammarVariables;
//         for (const variableName in tsxUpdatesBeforeTransformation.variables) {
//             variables[variableName] = tsxUpdatesBeforeTransformation.variables[variableName];
//         }
//         return variables;
//     });
//     const tsxUpdates = updateGrammarVariables(tsxUpdatesBeforeTransformation, variables!);

//     // Update name, file types, scope name and uuid
//     grammar.name = tsxUpdates.name;
//     grammar.scopeName = tsxUpdates.scopeName;
//     grammar.fileTypes = tsxUpdates.fileTypes;
//     grammar.uuid = tsxUpdates.uuid;

//     // Update scope names to .tsx
//     transformGrammarRepository(grammar, ["name", "contentName"], changeTsToTsx);

//     // Add repository items
//     const repository = grammar.repository;
//     const updatesRepository = tsxUpdates.repository;
//     for (let key in updatesRepository) {
//         switch(key) {
//             case "expressionWithoutIdentifiers":
//                 // Update expression
//                 (repository[key] as TmGrammarRepositoryPatterns).patterns.unshift((updatesRepository[key] as TmGrammarRepositoryPatterns).patterns[0]);
//                 break;
//             default:
//                 // Add jsx
//                 repository[key] = updatesRepository[key];
//         }
//     }

//     return grammar;
// }

function getTsGrammar(
  filePath: string,
  getVariables: (tsGrammarVariables: MapLike<string>) => MapLike<string>
) {
  const tsGrammarBeforeTransformation = readYaml(filePath) as TmGrammar;

  return updateGrammarVariables(
    tsGrammarBeforeTransformation,
    getVariables(tsGrammarBeforeTransformation.variables as MapLike<string>)
  );
}

function replacePatternVariables(
  pattern: string,
  variableReplacers: VariableReplacer[]
) {
  let result = pattern;
  for (const [variableName, value] of variableReplacers) {
    result = result.replace(variableName, value);
  }
  return result;
}

type VariableReplacer = [RegExp, string];
function updateGrammarVariables(
  grammar: TmGrammar,
  variables: MapLike<string>
) {
  delete grammar.variables;
  const variableReplacers: VariableReplacer[] = [];
  for (const variableName in variables) {
    // Replace the pattern with earlier variables
    const pattern = replacePatternVariables(
      variables[variableName],
      variableReplacers
    );
    variableReplacers.push([new RegExp(`{{${variableName}}}`, "gim"), pattern]);
  }
  transformGrammarRepository(grammar, ["begin", "end", "match"], (pattern) =>
    replacePatternVariables(pattern, variableReplacers)
  );
  return grammar;
}

function buildGrammar() {
  const langs = [Language.Paperclip];

  for (const lang of langs) {
    const pcGrammar = getTsGrammar(
      file(lang, Extension.YamlTmLanguage),
      (grammarVariables) => grammarVariables
    );
    writeJSONFile(pcGrammar, file(lang, Extension.JsonTmLanguage));
  }
}

buildGrammar();
