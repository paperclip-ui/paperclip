import React, { useCallback, useEffect, useRef } from "react";
import * as inputStyles from "@paperclip-ui/designer/src/styles/input.pc";
import { useSelector } from "@paperclip-ui/common";
import {
  SuggestionMenu,
  SuggestionMenuItem,
  SuggestionMenuSection,
} from "@paperclip-ui/designer/src/components/SuggestionMenu";
import {
  getAllPublicAtoms,
  getCurrentDependency,
  getCurrentDocumentImports,
} from "@paperclip-ui/designer/src/state";
import { TextInput } from "@paperclip-ui/designer/src/components/TextInput";
import { isColorValue, isUnitValue } from "./utils";
import { NewDeclValue, css } from "./types";
import { noop } from "lodash";

type FieldInputProps = {
  value?: string;
  isDefault: boolean;
  options?: string[];
  placeholder?: string;
  onChange?: (value: string) => void;
  onSave: (value: NewDeclValue) => void;
  onTab?: (event: React.KeyboardEvent) => void;
  type: css.InputType;
};

export const DeclarationValue = ({
  value,
  isDefault,
  placeholder,
  onChange = noop,
  options,
  type,
  onSave,
  onTab = noop,
}: FieldInputProps) => {
  const tokens = useSelector(getAllPublicAtoms);
  const dep = useSelector(getCurrentDependency);
  const imports = useSelector(getCurrentDocumentImports);

  const internalValue = useRef<NewDeclValue>();

  const onSelect = ([newValue]) => {
    onSave(newValue);
  };

  const onOtherSelect = (value) => {
    onSave({ value });
  };

  useEffect(() => {
    internalValue.current = { value };
  }, [value]);

  const menu = useCallback(() => {
    const ops = options?.length
      ? [
          <SuggestionMenuSection>Options</SuggestionMenuSection>,
          ...options.map((option) => (
            <SuggestionMenuItem
              value={option}
              selectValue={{ value: option }}
              filterText={option}
            />
          )),
        ]
      : [];

    // no enum options
    const availableTokens = tokens
      .filter((token) => {
        const isColor = isColorValue(token.cssValue);
        const isUnit = isUnitValue(token.cssValue);

        if (type === css.InputType.Unit) {
          // https://www.w3schools.com/cssref/css_units.php
          return isUnit;
        } else if (type === css.InputType.Color) {
          // https://www.smashingmagazine.com/2021/11/guide-modern-css-colors/
          return isColor;
        } else if (type === css.InputType.Enum) {
          return !(isUnit || isColor);
        } else if (type === css.InputType.Asset) {
          return /url/.test(token.cssValue);
        }
      })
      .map((token) => {
        // use existing NS so that we have preselected value
        const tokenNs =
          imports.find((imp) => {
            return dep.imports[imp.path] === token.dependency.path;
          })?.namespace || "mod";

        const value = `var(${tokenNs}.${token.atom.name})`;

        return (
          <SuggestionMenuItem
            key={token.atom.id}
            value={value}
            selectValue={{
              value,
              imports: {
                [tokenNs]: token.dependency.path,
              },
            }}
            filterText={token.atom.name + token.cssValue + token.value}
          >
            <inputStyles.TokenMenuContent
              style={{ "--color": token.cssValue }}
              preview={token.value}
              file={token.dependency.path.split("/").pop()}
            >
              {token.atom.name}
            </inputStyles.TokenMenuContent>
          </SuggestionMenuItem>
        );
      });

    if (availableTokens.length) {
      ops.push(
        <SuggestionMenuSection>Tokens</SuggestionMenuSection>,
        ...availableTokens
      );
    }

    return ops;
  }, [options, tokens, onSave, dep, imports]);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Tab") {
        onTab(event);
      }
    },
    [onTab]
  );

  return (
    <SuggestionMenu
      onChange={([value]) => {
        onChange(value);
      }}
      onSelect={onSelect}
      onOtherSelect={onOtherSelect}
      values={[value]}
      menu={menu}
      style={{ width: 350 }}
    >
      <TextInput
        value={isDefault ? undefined : value}
        placeholder={isDefault ? value : placeholder}
        onKeyDown={onKeyDown}
        select
      />
    </SuggestionMenu>
  );
};
