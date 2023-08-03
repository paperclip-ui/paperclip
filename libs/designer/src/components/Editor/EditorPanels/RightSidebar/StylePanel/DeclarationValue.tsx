import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import * as sidebarStyles from "@paperclip-ui/designer/src/styles/sidebar.pc";
import { ast } from "@paperclip-ui/proto-ext/lib/ast/pc-utils";
import * as inputStyles from "@paperclip-ui/designer/src/styles/input.pc";
import * as etcStyles from "@paperclip-ui/designer/src/styles/etc.pc";
import { memoize, useDispatch, useSelector } from "@paperclip-ui/common";
import { getSelectedExprStyles } from "@paperclip-ui/designer/src/state/pc";
import { DesignerEvent } from "@paperclip-ui/designer/src/events";
import {
  SuggestionMenu,
  SuggestionMenuItem,
  SuggestionMenuSection,
} from "@paperclip-ui/designer/src/components/SuggestionMenu";
import {
  getAllPublicAtoms,
  getCurrentDependency,
  getCurrentDocumentImports,
  getSelectedId,
} from "@paperclip-ui/designer/src/state";
import { TextInput } from "@paperclip-ui/designer/src/components/TextInput";
import { Variants } from "./Variants";
import { isColorValue, isUnitValue } from "./utils";
import { NewDeclValue, css } from "./types";

type FieldInputProps = {
  value?: string;
  isDefault: boolean;
  options?: string[];
  onSave: (value: NewDeclValue) => void;
  type: css.InputType;
};

export const DeclarationValue = ({
  value,
  isDefault,
  options,
  type,
  onSave,
}: FieldInputProps) => {
  const tokens = useSelector(getAllPublicAtoms);
  const dep = useSelector(getCurrentDependency);
  const imports = useSelector(getCurrentDocumentImports);

  const internalValue = useRef<NewDeclValue>();

  const onChange = (values: any[]) => {
    const newValue = values[values.length - 1];

    onSave(newValue);
  };

  const onOtherChange = (value) => {
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

  const onKeyDown = () => {};

  return (
    <SuggestionMenu
      onChange={onChange}
      onOtherChange={onOtherChange}
      values={[value]}
      menu={menu}
      style={{ width: 350 }}
    >
      <TextInput
        value={isDefault ? undefined : value}
        placeholder={isDefault ? value : undefined}
        onKeyDown={onKeyDown}
        select
      />
    </SuggestionMenu>
  );
};
