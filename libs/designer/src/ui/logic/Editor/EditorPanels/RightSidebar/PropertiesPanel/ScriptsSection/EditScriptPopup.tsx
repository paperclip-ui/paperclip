import React, { useState } from "react";
import cx from "classnames";
import * as sidebarStyles from "@paperclip-ui/designer/src/ui/logic/Sidebar/sidebar.pc";
import * as inputStyles from "@paperclip-ui/designer/src/ui/input.pc";
import { TextInput } from "@paperclip-ui/designer/src/ui/logic/TextInput";
import { SidebarPopup } from "@paperclip-ui/designer/src/ui/logic/SidebarPopup";
import { Script } from "@paperclip-ui/proto/lib/generated/ast/pc";
import { Button } from "@paperclip-ui/designer/src/ui/button.pc";

export type EditScriptPopupProps = {
  onClose: (data?: any) => void;
  script?: Script;
};

export const EditScriptPopup = (props: EditScriptPopupProps) => {
  const { script } = props;
  const { onFieldChange, onFieldSave, onClose, data, saveDisabled } =
    useEditScriptPopup(props);

  const fields = [
    { name: "src", label: "Source", placeholder: "./controller.tsx" },
    { name: "target", label: "Compiler", placeholder: "react" },
    { name: "name", label: "Import", placeholder: "SomeExport" },
  ];

  return (
    <SidebarPopup
      header={script ? "Edit Script" : "Add Script"}
      onCloseClick={() => onClose()}
    >
      <sidebarStyles.SidebarPopupPanelContent>
        <inputStyles.Fields>
          {fields.map((field, i) => {
            return (
              <inputStyles.Field
                name={field.label}
                input={
                  <TextInput
                    key={field.name}
                    value={data[field.name]}
                    autoFocus={i === 0}
                    placeholder={field.placeholder}
                    onChange={onFieldChange(field.name)}
                    onEnter={onFieldSave}
                  />
                }
              />
            );
          })}
          <inputStyles.Field
            name={" "}
            input={
              <Button
                class={cx("small", { disabled: saveDisabled })}
                root={{ onClick: onFieldSave }}
              >
                Save
              </Button>
            }
          />
        </inputStyles.Fields>
      </sidebarStyles.SidebarPopupPanelContent>
    </SidebarPopup>
  );
};

const useEditScriptPopup = ({ script, onClose }: EditScriptPopupProps) => {
  const [data, setData] = useState(
    script?.parameters.reduce(
      (params, param) => {
        params[param.name] = param.value.str.value;
        return params;
      },
      {
        id: script?.id,
      } as Record<string, string>
    ) ?? {}
  );

  const onFieldChange = (name: string) => (value: string) => {
    setData({ ...data, [name]: value });
  };
  const saveDisabled = !(data.src && data.target && data.name);
  const onFieldSave = () => {
    if (!saveDisabled) {
      onClose(data);
    }
  };

  return {
    data,
    saveDisabled,
    onClose,
    onFieldChange,
    onFieldSave,
  };
};
