import React from "react";
import * as inputStyles from "@paperclip-ui/designer/src/ui/input.pc";
import { useDispatch, useSelector } from "@paperclip-ui/common";
import {
  getActiveVariant,
  getEditVariantPopupOpened,
  getSelectedExpression,
  getSelectedExpressionInfo,
} from "@paperclip-ui/designer/src/state/pc";
import { ast } from "@paperclip-ui/core/lib/proto/ast/pc-utils";
import { EditVariantPopup } from "./EditVariantPopup";
import { Component, Variant } from "@paperclip-ui/proto/lib/generated/ast/pc";
import { DesignerEvent } from "@paperclip-ui/designer/src/events";
import { getEditorState } from "@paperclip-ui/designer/src/state";

export const ScriptsSection = () => {
  const expr = useSelector(getSelectedExpressionInfo);

  if (expr.kind !== ast.ExprKind.Component) {
    return null;
  }

  return <ScriptsSectionInner />;
};

export const ScriptsSectionInner = () => {
  const { scripts, onAddClick } = useScriptsSection();
  const projectDir = useSelector(getEditorState).projectDirectory;

  const inputs = [
    ...scripts.map((script) => {
      return (
        <inputStyles.ListItemInput
          key={script.id}
          root={{
            // onClick: () => onSelectVariant(variant),
            className: "removable",
          }}
          removeButton={{
            onClick: (event: React.MouseEvent<any>) => {
              event.stopPropagation();
              // onRemoveVariant(variant);
            },
          }}
        >
          {
            script.parameters.find((param) => param.name === "src")?.value?.str
              .value
          }
        </inputStyles.ListItemInput>
      );
    }),
    <inputStyles.AddListItemButton
      key="add-button"
      root={{ onClick: onAddClick }}
    />,
  ];

  return (
    <>
      {/* {editVariantPopupOpen && (
        <EditVariantPopup
          name={activeVariant?.name}
          onSave={onSaveCurrentVariant}
          onClose={onCloseEditVariantPopup}
          triggers={activeVariant?.triggers}
        />
      )} */}
      <inputStyles.Field name="Scripts" input={inputs[0]} />
      {...inputs
        .slice(1)
        .map((input, i) => (
          <inputStyles.Field name=" " key={i} input={input} />
        ))}
    </>
  );
};

const useScriptsSection = () => {
  const component = useSelector(getSelectedExpression) as Component;
  const scripts = ast.getComponentScripts(component);
  const onAddClick = () => {};

  return {
    component,
    scripts,
    onAddClick,
  };
};
