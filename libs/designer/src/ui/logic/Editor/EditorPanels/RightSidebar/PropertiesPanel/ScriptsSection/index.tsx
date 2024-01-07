import React, { useState } from "react";
import * as inputStyles from "@paperclip-ui/designer/src/ui/input.pc";
import { useDispatch, useSelector } from "@paperclip-ui/common";
import {
  getSelectedExpression,
  getSelectedExpressionInfo,
} from "@paperclip-ui/designer/src/state/pc";
import { ast } from "@paperclip-ui/core/lib/proto/ast/pc-utils";
import { Component, Script } from "@paperclip-ui/proto/lib/generated/ast/pc";
import { EditScriptPopup } from "./EditScriptPopup";
import { DesignerEvent } from "@paperclip-ui/designer/src/events";
import { getEditorState } from "@paperclip-ui/designer/src/state";

export const ScriptsSection = () => {
  const expr = useSelector(getSelectedExpressionInfo);
  const capabilities =
    useSelector(getEditorState).projectInfo?.experimentalCapabilities || [];

  if (
    expr.kind !== ast.ExprKind.Component ||
    !capabilities.includes("script")
  ) {
    return null;
  }

  return <ScriptsSectionInner />;
};

export const ScriptsSectionInner = () => {
  const {
    editScriptPopupOpen,
    scripts,
    onAddClick,
    onSelectScript,
    onRemoveScript,
    activeScript,
    onCloseScriptPopup,
  } = useScriptsSection();

  const inputs = [
    ...scripts.map((script) => {
      return (
        <inputStyles.ListItemInput
          key={script.id}
          root={{
            onClick: (event) => onSelectScript(script, event),
            className: "removable",
          }}
          removeButton={{
            onClick: (event: React.MouseEvent<any>) => {
              event.stopPropagation();
              onRemoveScript(script);
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
      {editScriptPopupOpen && (
        <EditScriptPopup script={activeScript} onClose={onCloseScriptPopup} />
      )}
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
  const dispatch = useDispatch<DesignerEvent>();

  const [editScriptPopupOpen, setEditScriptPopupOpen] = useState(false);
  const [activeScript, setActiveScript] = useState<Script>();
  const onAddClick = () => setEditScriptPopupOpen(true);
  const onSelectScript = (value: Script, event: React.MouseEvent<any>) => {
    if (event.metaKey) {
      dispatch({ type: "ui/metaClickScript", payload: value });
    } else {
      setActiveScript(value);
      setEditScriptPopupOpen(true);
    }
  };
  const onRemoveScript = (value: Script) => {
    dispatch({ type: "ui/scriptRemoved", payload: { id: value.id } });
  };

  const onCloseScriptPopup = (data: any) => {
    if (data) {
      dispatch({ type: "ui/scriptSaved", payload: data });
    }

    setActiveScript(null);
    setEditScriptPopupOpen(false);
  };

  return {
    activeScript,
    editScriptPopupOpen,
    component,
    onSelectScript,
    onCloseScriptPopup,
    onRemoveScript,
    scripts,
    onAddClick,
  };
};
