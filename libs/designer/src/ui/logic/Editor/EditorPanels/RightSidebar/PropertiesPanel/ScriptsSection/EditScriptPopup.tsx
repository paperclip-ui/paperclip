import React, { useState } from "react";
import * as sidebarStyles from "@paperclip-ui/designer/src/ui/logic/Sidebar/sidebar.pc";
import * as inputStyles from "@paperclip-ui/designer/src/ui/input.pc";
import { TextInput } from "@paperclip-ui/designer/src/ui/logic/TextInput";
import { SidebarPopup } from "@paperclip-ui/designer/src/ui/logic/SidebarPopup";
import { Script } from "@paperclip-ui/proto/lib/generated/ast/pc";

export type EditScriptPopupProps = {
  onSave?: (data: any) => void;
  onClose?: () => void;
  script?: Script;
};

export const EditScriptPopup = (props: EditScriptPopupProps) => {
  const { script, onClose } = props;
  const { onFieldChange, onFieldSave, data } = useEditScriptPopup(props);

  const fields = [
    { name: "src", label: "Source", placeholder: "./controller.tsx" },
    { name: "target", label: "Compiler", placeholder: "react" },
    { name: "name", label: "Import", placeholder: "SomeExport" },
  ];

  return (
    <SidebarPopup
      header={script ? "Edit Script" : "Add Script"}
      onCloseClick={onClose}
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
                    onBlur={onFieldSave}
                  />
                }
              />
            );
          })}
        </inputStyles.Fields>
      </sidebarStyles.SidebarPopupPanelContent>
    </SidebarPopup>
  );
};

const useEditScriptPopup = ({ script, onSave }: EditScriptPopupProps) => {
  const [data, setData] = useState(
    script?.parameters.reduce((params, param) => {
      params[param.name] = param.value.str.value;
      return params;
    }, {} as Record<string, string>) ?? {}
  );

  const onFieldChange = (name: string) => (value: string) => {
    setData({ ...data, [name]: value });
  };
  const onFieldSave = () => {
    onSave(data);
  };

  return {
    data,
    onFieldChange,
    onFieldSave,
  };
};
