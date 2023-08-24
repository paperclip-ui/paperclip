import React, { useCallback, useEffect, useRef } from "react";
import * as inputStyles from "@paperclip-ui/designer/src/styles/input.pc";
import { useSelector } from "@paperclip-ui/common";
import {
  SelectDetails,
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
  autoFocus?: boolean;
  placeholder?: string;
  onSelect: (value: NewDeclValue, details) => void;
  onTab?: (event: React.KeyboardEvent) => void;
  type: css.InputType;
};

export const DeclarationValue = ({
  value,
  isDefault,
  placeholder,
  autoFocus,
  options,
  type,
  onSelect: onSelect2,
  onTab = noop,
}: FieldInputProps) => {
  const tokens = useSelector(getAllPublicAtoms);
  const dep = useSelector(getCurrentDependency);
  const imports = useSelector(getCurrentDocumentImports);

  const internalValue = useRef<NewDeclValue>();

  const onSelect = ([newValue], details: SelectDetails) => {
    onSelect2(newValue, details);
  };

  const onOtherSelect = (value, details: SelectDetails) => {
    onSelect2({ value }, details);
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
              context={token.dependency.path.split("/").pop()}
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
  }, [options, tokens, onSelect2, dep, imports]);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Tab" && !event.shiftKey) {
        onTab(event);
      }
    },
    [onTab]
  );

  return (
    <SuggestionMenu
      onSelect={onSelect}
      onOtherSelect={onOtherSelect}
      values={[value]}
      menu={menu}
      style={{ width: 350 }}
    >
      <TextInput
        autoFocus={autoFocus}
        value={isDefault ? undefined : value}
        placeholder={isDefault ? value : placeholder}
        onKeyDown={onKeyDown}
        select
      />
    </SuggestionMenu>
  );
};
