import { useDispatch, useSelector } from "@paperclip-ui/common";
import {
  getNodeAncestors,
  getNodePath,
} from "@paperclip-ui/proto/lib/virt/html-utils";
import React from "react";
import { editorEvents } from "../../../machine/events";
import { getEditorState } from "../../../machine/state";
import * as styles from "./styles.pc";

export const Footer = () => {
  const { ancestors, dispatch } = useFooter();
  if (!ancestors) {
    return null;
  }

  return (
    <styles.TmpFooter>
      {ancestors.map((ancestor) => {
        const onBreadcrumbClick = () => {
          dispatch(editorEvents.tmpBreadcrumbClicked(ancestor));
        };

        return (
          <>
            <a href="#" onClick={onBreadcrumbClick}>
              {ancestor.sourceId}
            </a>{" "}
          </>
        );
      })}
    </styles.TmpFooter>
  );
};

const useFooter = () => {
  const { currentDocument, selectedNodePaths } = useSelector(getEditorState);
  const dispatch = useDispatch();
  const mainPath = selectedNodePaths[0];
  const ancestors =
    mainPath &&
    [...getNodeAncestors(mainPath, currentDocument.paperclip.html)].reverse();

  return {
    ancestors,
    dispatch,
  };
};
