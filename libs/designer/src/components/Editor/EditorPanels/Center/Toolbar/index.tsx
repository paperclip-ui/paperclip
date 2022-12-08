import React from "react";
import * as toolbarStyles from "@paperclip-ui/designer/src/styles/toolbar.pc";
import cx from "classnames";
import { useDispatch, useSelector } from "@paperclip-ui/common";
import {
  getCanvas,
  getInsertMode,
  InsertMode,
} from "@paperclip-ui/designer/src/state";
import { editorEvents } from "@paperclip-ui/designer/src/events";

export const Toolbar = () => {
  const { zoom, insertMode, onInsertElementClick, onInsertTextClick } =
    useToolbar();

  return (
    <toolbarStyles.Toolbar>
      <toolbarStyles.ToolbarButton
        class={cx({ active: insertMode === InsertMode.Text })}
        onClick={onInsertTextClick}
      >
        <toolbarStyles.ToolbarIcon class="text" />
      </toolbarStyles.ToolbarButton>
      <toolbarStyles.ToolbarButton
        class={cx({ active: insertMode === InsertMode.Element })}
        onClick={onInsertElementClick}
      >
        <toolbarStyles.ToolbarIcon class="element" />
      </toolbarStyles.ToolbarButton>
      <toolbarStyles.ToolbarDivider />
      <toolbarStyles.ToolbarButton disabled class="wide" style={{ width: 75 }}>
        {zoom}%
      </toolbarStyles.ToolbarButton>
    </toolbarStyles.Toolbar>
  );
};

const useToolbar = () => {
  const canvas = useSelector(getCanvas);
  const insertMode = useSelector(getInsertMode);
  const dispatch = useDispatch();
  const onInsertElementClick = () =>
    dispatch(editorEvents.insertModeButtonClick({ mode: InsertMode.Element }));
  const onInsertTextClick = () =>
    dispatch(editorEvents.insertModeButtonClick({ mode: InsertMode.Text }));

  return {
    zoom: Math.round(canvas.transform.z * 100),
    insertMode,
    onInsertElementClick,
    onInsertTextClick,
  };
};
