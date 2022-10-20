import { useSelector } from "@paperclip-ui/common";
import { getNodeAncestors } from "@paperclip-ui/proto/lib/virt/html";
import React from "react";
import { getEditorState } from "../../../machine/state";
import * as styles from "./styles.pc";

export const Footer = () => {
  const { ancestors } = useFooter();
  if (!ancestors) {
    return null;
  }

  return (
    <styles.TmpFooter>
      {ancestors.map((ancestor) => {
        return (
          <>
            <a href="#">{JSON.stringify(ancestor)}</a>{" "}
          </>
        );
      })}
    </styles.TmpFooter>
  );
};

const useFooter = () => {
  const { currentDocument, selectedNodePaths } = useSelector(getEditorState);
  const mainPath = selectedNodePaths[0];
  const ancestors =
    mainPath && getNodeAncestors(mainPath, currentDocument.paperclip.html);

  return {
    ancestors,
  };
};
