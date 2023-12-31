import {
  SuggestionMenu,
  SuggestionMenuItem,
} from "@paperclip-ui/designer/src/ui/logic/SuggestionMenu";
import {
  Field,
  MenuContent,
  SuggestionMenuSection,
  TokenMenuContent,
} from "@paperclip-ui/designer/src/ui/input.pc";
import React, { useCallback, useMemo } from "react";
import { TAG_NAMES } from "./constants";
import { TextInput } from "@paperclip-ui/designer/src/ui/logic/TextInput";
import { ast } from "@paperclip-ui/core/lib/proto/ast/pc-utils";
import { Element } from "@paperclip-ui/proto/lib/generated/ast/pc";
import { useDispatch, useSelector } from "@paperclip-ui/common";
import { DesignerEvent } from "@paperclip-ui/designer/src/events";
import {
  getGraph,
  getGraphComponents,
  getSelectedExpressionInfo,
} from "@paperclip-ui/designer/src/state";

export const ExprTagNameField = () => {
  const expr = useSelector(getSelectedExpressionInfo);
  const el =
    expr.kind === ast.ExprKind.Component
      ? ast.getComponentRenderNode(expr.expr)
      : expr;

  if (el?.kind !== ast.ExprKind.Element) {
    return null;
  }

  return <Field name="tag" input={<ExprTagNameInput el={el} />} />;
};

type ExprTagNameInputProps = {
  el: ast.BaseExprInfo<Element, ast.ExprKind.Element>;
};

export const ExprTagNameInput = ({ el }: ExprTagNameInputProps) => {
  const dispatch = useDispatch<DesignerEvent>();

  const onChange = useCallback((newTag: TagOption) => {
    dispatch({
      type: "ui/elementTagChanged",
      payload: { tagName: newTag.value, sourceFilePath: newTag.sourcePath },
    });
  }, []);

  return <TagInput value={el.expr.tagName} onChange={onChange} />;
};

type TagInputProps = {
  value: string;
  onChange: (value: TagOption) => void;
};

type TagOption = {
  value: string;
  sourcePath?: string;
};

const TagInput = ({ value, onChange }: TagInputProps) => {
  const values = useMemo(() => [value], [value]);
  const graph = useSelector(getGraph);

  const menu = useCallback(() => {
    const publicComponents = getGraphComponents(graph).filter(
      (c) => c.component.isPublic
    );

    const options = [
      <SuggestionMenuSection>Native</SuggestionMenuSection>,
      ...TAG_NAMES.map((tagName) => {
        return (
          <SuggestionMenuItem
            key={tagName}
            value={tagName}
            selectValue={{ value: tagName }}
            filterText={tagName}
          >
            <MenuContent context="native">{tagName}</MenuContent>
          </SuggestionMenuItem>
        );
      }),
    ];

    if (publicComponents.length) {
      options.push(<SuggestionMenuSection>Components</SuggestionMenuSection>);
      options.push(
        ...publicComponents.map((c) => {
          return (
            <SuggestionMenuItem
              key={c.component.id}
              value={c.component.name}
              selectValue={{
                value: c.component.name,
                sourcePath: c.sourcePath,
              }}
              filterText={c.component.name + c.sourcePath}
            >
              <MenuContent context={c.sourcePath.split("/").pop()}>
                {c.component.name}
              </MenuContent>
            </SuggestionMenuItem>
          );
        })
      );
    }

    return options;
  }, [graph]);

  const onSelect = useCallback(
    ([value]) => {
      onChange(value);
    },
    [onChange]
  );

  const onOtherSelect = useCallback(
    (value: string) => {
      onChange({ value });
    },
    [onChange]
  );

  return (
    <SuggestionMenu menu={menu} values={values} onSelect={onSelect}>
      <TextInput placeholder="tag name" value={value} />
    </SuggestionMenu>
  );
};
