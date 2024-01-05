import React from "react";
import { getCurrentFilePath, getEditorState } from "../../state";
import { BaseAssetPreviewProps } from "./ui.pc";
import { useSelector } from "@paperclip-ui/common";

export const AssetPreview = (Base: React.FC<BaseAssetPreviewProps>) => () => {
  const currentFile = useSelector(getCurrentFilePath);
  const projectDirectory = useSelector(getEditorState).projectDirectory;

  return (
    <Base>
      {(projectDirectory && currentFile && (
        <img
          src={currentFile.replace(projectDirectory.path, "assets")}
          style={{ width: "100%" }}
        />
      )) || <></>}
    </Base>
  );
};
