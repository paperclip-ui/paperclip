import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import * as styles from "@paperclip-ui/designer/src/styles/left-sidebar.pc";
import * as sidebarStyles from "@paperclip-ui/designer/src/styles/sidebar.pc";
import { useDispatch, useSelector } from "@paperclip-ui/common";
import {
  DNDKind,
  DesignerState,
  getCurrentDependency,
  getCurrentFilePath,
  getExpandedVirtIds,
  getGraph,
  getSelectedId,
} from "@paperclip-ui/designer/src/state";
import {
  Component,
  DocumentBodyItem,
  Element,
  Insert,
  Node,
  Slot,
  TextNode,
} from "@paperclip-ui/proto/lib/generated/ast/pc";
import { ast } from "@paperclip-ui/proto-ext/lib/ast/pc-utils";
import { DesignerEvent } from "@paperclip-ui/designer/src/events";
import cx from "classnames";
import { useHistory } from "@paperclip-ui/designer/src/domains/history/react";
import { routes } from "@paperclip-ui/designer/src/state/routes";
import { useDrag, useDrop } from "react-dnd";
import { SuggestionMenu, SuggestionMenuItem } from "../../../SuggestionMenu";
import { Atom } from "@paperclip-ui/proto/lib/generated/ast/pc";
import { Layers } from "./Layers";

export const LeftSidebar = () => {
  const { title, document, show, onBackClick } = useLeftSidebar();

  if (!document || !show) {
    return null;
  }

  return (
    <styles.LeftSidebar>
      <sidebarStyles.SidebarPanel>
        <styles.LeftSidebarHeader title={title} onBackClick={onBackClick} />
        <Layers />
      </sidebarStyles.SidebarPanel>
    </styles.LeftSidebar>
  );
};

const useLeftSidebar = () => {
  const currentFile = useSelector(getCurrentFilePath);
  const dependency = useSelector(getCurrentDependency);
  const show = useSelector((state: DesignerState) => state.showLeftSidebar);
  const history = useHistory();
  const onBackClick = () => {
    history.redirect(routes.dashboard());
  };

  return {
    show,
    onBackClick,
    title: currentFile.split("/").pop(),
    document: dependency?.document,
  };
};
