import { publicActionCreator } from "tandem-common";
export const PROJECT_LOADED = "PROJECT_LOADED";
export const ACTIVE_FILE_CHANGED = "ACTIVE_FILE_CHANGED";
export const SYNTHETIC_WINDOW_OPENED = "SYNTHETIC_WINDOW_OPENED";
export const PROJECT_DIRECTORY_LOADED = "PROJECT_DIRECTORY_LOADED";
export const DOCUMENT_RENDERED = "DOCUMENT_RENDERERED";
export const CANVAS_TOOL_OVERLAY_MOUSE_LEAVE = "CANVAS_TOOL_OVERLAY_MOUSE_LEAVE";
export const CANVAS_TOOL_OVERLAY_MOUSE_PAN_START = "CANVAS_TOOL_OVERLAY_MOUSE_PAN_START";
export const CANVAS_TOOL_OVERLAY_MOUSE_PANNING = "CANVAS_TOOL_OVERLAY_MOUSE_PANNING";
export const CANVAS_TOOL_OVERLAY_MOUSE_PAN_END = "CANVAS_TOOL_OVERLAY_MOUSE_PAN_END";
export const CANVAS_TOOL_OVERLAY_MOUSE_DOUBLE_CLICKED = "CANVAS_TOOL_OVERLAY_MOUSE_DOUBLE_CLICKED";
export const CANVAS_TOOL_WINDOW_BACKGROUND_CLICKED = "CANVAS_TOOL_WINDOW_BACKGROUND_CLICKED";
export const CANVAS_TOOL_WINDOW_KEY_DOWN = "CANVAS_TOOL_WINDOW_KEY_DOWN";
export const CANVAS_TOOL_ARTBOARD_TITLE_CLICKED = "CANVAS_TOOL_ARTBOARD_TITLE_CLICKED";
export const CANVAS_TOOL_PREVIEW_BUTTON_CLICKED = "CANVAS_TOOL_PREVIEW_BUTTON_CLICKED";
export const FILE_NAVIGATOR_ITEM_CLICKED = "FILE_NAVIGATOR_ITEM_CLICKED";
export const FILE_NAVIGATOR_ITEM_DOUBLE_CLICKED = "FILE_NAVIGATOR_ITEM_DOUBLE_CLICKED";
export const FILE_NAVIGATOR_ITEM_BLURRED = "FILE_NAVIGATOR_ITEM_BLURRED";
export const FILE_NAVIGATOR_NEW_FILE_CLICKED = "FILE_NAVIGATOR_NEW_FILE_CLICKED";
export const FILE_NAVIGATOR_NEW_DIRECTORY_CLICKED = "FILE_NAVIGATOR_NEW_DIRECTORY_CLICKED";
export const FILE_NAVIGATOR_TOGGLE_DIRECTORY_CLICKED = "FILE_NAVIGATOR_TOGGLE_DIRECTORY_CLICKED";
export const FILE_NAVIGATOR_BASENAME_CHANGED = "FILE_NAVIGATOR_BASENAME_CHANGED";
export const FILE_NAVIGATOR_NEW_FILE_ENTERED = "FILE_NAVIGATOR_NEW_FILE_ENTERED";
export const FILE_NAVIGATOR_DROPPED_ITEM = "FILE_NAVIGATOR_DROPPED_ITEM";
export const TOOLBAR_TOOL_CLICKED = "TOOLBAR_TOOL_CLICKED";
export const EDITOR_TAB_CLICKED = "EDITOR_TAB_CLICKED";
export const EDITOR_TAB_RIGHT_CLICKED = "EDITOR_TAB_RIGHT_CLICKED";
export const EDITOR_TAB_CLOSE_BUTTON_CLICKED = "EDITOR_TAB_CLOSE_BUTTON_CLICKED";
export const EDITOR_TAB_CONTEXT_MENU_OPEN_IN_BOTTOM_OPTION_CLICKED = "EDITOR_TAB_CONTEXT_MENU_OPEN_IN_BOTTOM_OPTION_CLICKED";
export const MODULE_CONTEXT_MENU_CLOSE_OPTION_CLICKED = "MODULE_CONTEXT_MENU_CLOSE_OPTION_CLICKED";
export const OPEN_FILE_ITEM_CLICKED = "OPEN_FILE_ITEM_CLICKED";
export const OPEN_FILE_ITEM_CLOSE_CLICKED = "OPEN_FILE_ITEM_CLOSE_CLICKED";
export const CANVAS_MOUNTED = "CANVAS_MOUNTED";
export const CANVAS_MOUSE_MOVED = "CANVAS_MOUSE_MOVED";
export const CANVAS_DRAGGED_OVER = "CANVAS_DRAGGED_OVER";
export const CANVAS_MOUSE_CLICKED = "CANVAS_MOUSE_CLICKED";
export const CANVAS_MOUSE_DOUBLE_CLICKED = "CANVAS_MOUSE_DOUBLE_CLICKED";
export const CANVAS_WHEEL = "CANVAS_WHEEL";
export const CANVAS_MOTION_RESTED = "CANVAS_MOTION_RESTED";
export const CANVAS_DROPPED_ITEM = "CANVAS_DROPPED_ITEM";
export const ADD_VARIANT_BUTTON_CLICKED = "ADD_VARIANT_BUTTON_CLICKED";
export const REMOVE_VARIANT_BUTTON_CLICKED = "REMOVE_VARIANT_BUTTON_CLICKED";
export const VARIANT_DEFAULT_SWITCH_CLICKED = "VARIANT_DEFAULT_SWITCH_CLICKED";
export const VARIANT_LABEL_CHANGED = "VARIANT_LABEL_CHANGED";
export const ADD_STYLE_BUTTON_CLICKED = "ADD_STYLE_BUTTON_CLICKED";
export const NEW_STYLE_VARIANT_CONFIRMED = "NEW_STYLE_VARIANT_CONFIRMED";
export const NEW_STYLE_VARIANT_BUTTON_CLICKED = "NEW_STYLE_VARIANT_BUTTON_CLICKED";
export const PROMPT_OK_BUTTON_CLICKED = "PROMPT_OK_BUTTON_CLICKED";
export const PROMPT_CANCEL_BUTTON_CLICKED = "PROMPT_CANCEL_BUTTON_CLICKED";
export const REMOVE_STYLE_BUTTON_CLICKED = "ADD_STYLE_BUTTON_CLICKED";
export const EDIT_VARIANT_NAME_BUTTON_CLICKED = "EDIT_VARIANT_NAME_BUTTON_CLICKED";
export const EDIT_VARIANT_NAME_CONFIRMED = "EDIT_VARIANT_NAME_CONFIRMED";
export const STYLE_VARIANT_DROPDOWN_CHANGED = "STYLE_VARIANT_DROPDOWN_CHANGED";
export const ADD_VARIABLE_BUTTON_CLICKED = "ADD_VARIABLE_BUTTON_CLICKED";
export const QUICK_SEARCH_FILTER_CHANGED = "QUICK_SEARCH_FILTER_CHANGED";
export const QUICK_SEARCH_RESULT_LOADED = "QUICK_SEARCH_RESULT_LOADED";
export const VARIABLE_LABEL_CHANGE_COMPLETED = "VARIABLE_LABEL_CHANGE_COMPLETED";
export const VARIABLE_VALUE_CHANGED = "VARIABLE_VALUE_CHANGED";
export const VARIABLE_VALUE_CHANGE_COMPLETED = "VARIABLE_VALUE_CHANGE_COMPLETED";
export const COMPONENT_INSTANCE_VARIANT_TOGGLED = "COMPONENT_INSTANCE_VARIANT_TOGGLED";
export const INSTANCE_VARIANT_RESET_CLICKED = "INSTANCE_VARIANT_RESET_CLICKED";
export const FRAME_MODE_CHANGE_COMPLETE = "FRAME_MODE_CHANGE_COMPLETE";
export const RESIZER_PATH_MOUSE_MOVED = "RESIZER_PATH_MOUSE_MOVED";
export const RESIZER_PATH_MOUSE_STOPPED_MOVING = "RESIZER_PATH_MOUSE_STOPPED_MOVING";
export const RESIZER_MOVED = "RESIZER_MOVED";
export const RESIZER_STOPPED_MOVING = "RESIZER_STOPPED_MOVING";
export const COMPONENT_PICKER_BACKGROUND_CLICK = "COMPONENT_PICKER_BACKGROUND_CLICK";
export const UNHANDLED_ERROR = "UNHANDLED_ERROR";
export const COMPONENT_PICKER_ITEM_CLICK = "COMPONENT_PICKER_ITEM_CLICK";
export const RESIZER_MOUSE_DOWN = "RESIZER_MOUSE_DOWN";
export const RESIZER_START_DRGG = "RESIZER_START_DRGG";
export const TD_PROJECT_LOADED = "TD_PROJECT_LOADED";
export const CONFIRM_CLOSE_WINDOW = "CONFIRM_CLOSE_WINDOW";
export const PROJECT_INFO_LOADED = "PROJECT_INFO_LOADED";
export const SHORTCUT_ZOOM_IN_KEY_DOWN = "SHORTCUT_ZOOM_IN_KEY_DOWN";
export const SHORTCUT_TOGGLE_PANEL = "SHORTCUT_TOGGLE_PANEL";
export const SHORTCUT_ZOOM_OUT_KEY_DOWN = "SHORTCUT_ZOOM_OUT_KEY_DOWN";
export const SHORTCUT_ESCAPE_KEY_DOWN = "SHORTCUT_ESCAPE_KEY_DOWN";
export const SHORTCUT_SAVE_KEY_DOWN = "SHORTCUT_SAVE_KEY_DOWN";
export const SHORTCUT_QUICK_SEARCH_KEY_DOWN = "SHORTCUT_QUICK_SEARCH_KEY_DOWN";
export const SHORTCUT_DELETE_KEY_DOWN = "SHORTCUT_DELETE_KEY_DOWN";
export const SHORTCUT_UNDO_KEY_DOWN = "SHORTCUT_UNDO_KEY_DOWN";
export const SHORTCUT_REDO_KEY_DOWN = "SHORTCUT_REDO_KEY_DOWN";
export const SHORTCUT_R_KEY_DOWN = "SHORTCUT_R_KEY_DOWN";
export const SHORTCUT_C_KEY_DOWN = "SHORTCUT_C_KEY_DOWN";
export const SHORTCUT_T_KEY_DOWN = "SHORTCUT_T_KEY_DOWN";
export const SHORTCUT_SELECT_NEXT_TAB = "SHORTCUT_SELECT_NEXT_TAB";
export const SHORTCUT_SELECT_PREVIOUS_TAB = "SHORTCUT_SELECT_PREVIOUS_TAB";
export const SHORTCUT_CLOSE_CURRENT_TAB = "SHORTCUT_CLOSE_CURRENT_TAB";
export const OPEN_TEXT_EDITOR_BUTTON_CLICKED = "OPEN_TEXT_EDITOR_BUTTON_CLICKED";
export const SHORTCUT_CONVERT_TO_COMPONENT_KEY_DOWN = "SHORTCUT_CONVERT_TO_COMPONENT_KEY_DOWN";
export const SHORTCUT_WRAP_IN_SLOT_KEY_DOWN = "SHORTCUT_WRAP_IN_SLOT_KEY_DOWN";
export const SHORTCUT_TOGGLE_SIDEBAR = "SHORTCUT_TOGGLE_SIDEBAR";
export const INHERIT_PANE_ADD_BUTTON_CLICK = "INHERIT_PANE_ADD_BUTTON_CLICK";
export const FILE_ITEM_CONTEXT_MENU_DELETE_CLICKED = "FILE_ITEM_CONTEXT_MENU_DELETE_CLICKED";
export const FILE_ITEM_CONTEXT_MENU_OPEN_CLICKED = "FILE_ITEM_CONTEXT_MENU_OPEN_CLICKED";
export const FILE_ITEM_CONTEXT_MENU_OPEN_IN_FINDER_CLICKED = "FILE_ITEM_CONTEXT_MENU_OPEN_IN_FINDER_CLICKED";
export const FILE_ITEM_CONTEXT_MENU_COPY_PATH_CLICKED = "FILE_ITEM_CONTEXT_MENU_COPY_PATH_CLICKED";
export const FILE_ITEM_CONTEXT_MENU_RENAME_CLICKED = "FILE_ITEM_CONTEXT_MENU_RENAME_CLICKED";
export const FILE_ITEM_CONTEXT_MENU_CREATE_DIRECTORY_CLICKED = "FILE_ITEM_CONTEXT_MENU_CREATE_DIRECTORY_CLICKED";
export const FILE_ITEM_CONTEXT_MENU_CREATE_BLANK_FILE_CLICKED = "FILE_ITEM_CONTEXT_MENU_CREATE_BLANK_FILE_CLICKED";
export const FILE_ITEM_CONTEXT_MENU_CREATE_COMPONENT_FILE_CLICKED = "FILE_ITEM_CONTEXT_MENU_CREATE_COMPONENT_FILE_CLICKED";
export const INSPECTOR_NODE_CONTEXT_MENU_CONVERT_TO_COMPONENT_CLICKED = "INSPECTOR_NODE_CONTEXT_MENU_CONVERT_TO_COMPONENT_CLICKED";
export const INSPECTOR_NODE_CONTEXT_MENU_WRAP_IN_ELEMENT_CLICKED = "INSPECTOR_NODE_CONTEXT_MENU_WRAP_IN_ELEMENT_CLICKED";
export const INSPECTOR_NODE_CONTEXT_MENU_CONVERT_TO_STYLE_MIXIN_CLICKED = "INSPECTOR_NODE_CONTEXT_MENU_CONVERT_TO_STYLE_MIXIN_CLICKED";
export const INSPECTOR_NODE_CONTEXT_MENU_CONVERT_TEXT_STYLES_TO_MIXIN_CLICKED = "INSPECTOR_NODE_CONTEXT_MENU_CONVERT_TEXT_STYLES_TO_MIXIN_CLICKED";
export const INSPECTOR_NODE_CONTEXT_MENU_REMOVE_CLICKED = "INSPECTOR_NODE_CONTEXT_MENU_REMOVE_CLICKED";
export const INSPECTOR_NODE_CONTEXT_MENU_RENAME_CLICKED = "INSPECTOR_NODE_CONTEXT_MENU_RENAME_CLICKED";
export const INSPECTOR_NODE_CONTEXT_MENU_COPY_CLICKED = "INSPECTOR_NODE_CONTEXT_MENU_COPYCLICKED";
export const INSPECTOR_NODE_CONTEXT_MENU_PASTE_CLICKED = "INSPECTOR_NODE_CONTEXT_MENU_PASTE_CLICKED";
export const INSPECTOR_NODE_CONTEXT_MENU_WRAP_IN_SLOT_CLICKED = "INSPECTOR_NODE_CONTEXT_MENU_WRAP_IN_SLOT_CLICKED";
export const INSPECTOR_NODE_CONTEXT_MENU_SELECT_PARENT_CLICKED = "INSPECTOR_NODE_CONTEXT_MENU_SELECT_PARENT_CLICKED";
export const INSPECTOR_NODE_CONTEXT_MENU_SELECT_SOURCE_NODE_CLICKED = "INSPECTOR_NODE_CONTEXT_MENU_SELECT_SOURCE_NODE_CLICKED";
export const INSPECTOR_NODE_CONTEXT_MENU_SHOW_IN_CANVAS_CLICKED = "INSPECTOR_NODE_CONTEXT_MENU_SHOW_IN_CANVAS_CLICKED";
export const INHERIT_PANE_REMOVE_BUTTON_CLICK = "INHERIT_PANE_REMOVE_BUTTON_CLICK";
export const EXPORT_NAME_CHANGED = "EXPORT_NAME_CHANGED";
export const ACTIVE_EDITOR_URI_DIRS_LOADED = "ACTIVE_EDITOR_URI_DIRS_LOADED";
export const INHERIT_ITEM_COMPONENT_TYPE_CHANGE_COMPLETE = "INHERIT_ITEM_COMPONENT_TYPE_CHANGE_COMPLETE";
export const INHERIT_ITEM_CLICK = "INHERIT_ITEM_CLICK";
export const INSERT_TOOL_FINISHED = "INSERT_TOOL_FINISHED";
export const INSPECTOR_NODES_PASTED = "INSPECTOR_NODES_PASTED";
export const APP_LOADED = "APP_LOADED";
export const SAVED_FILE = "SAVED_FILE";
export const SAVED_ALL_FILES = "SAVED_ALL_FILES";
export const FRAME_BOUNDS_CHANGED = "FRAME_BOUNDS_CHANGED";
export const FRAME_BOUNDS_CHANGE_COMPLETED = "FRAME_BOUNDS_CHANGE_COMPLETED";
export const NEW_FILE_ENTERED = "NEW_FILE_ENTERED";
export const PROJECT_DIRECTORY_DIR_LOADED = "PROJECT_DIRECTORY_DIR_LOADED";
export const NEW_DIRECTORY_ENTERED = "NEW_DIRECTORY_ENTERED";
export const RAW_CSS_TEXT_CHANGED = "RAW_CSS_TEXT_CHANGED";
export const CSS_PROPERTY_CHANGED = "CSS_PROPERTY_CHANGED";
export const CSS_PROPERTIES_CHANGED = "CSS_PROPERTIES_CHANGED";
export const QUICK_SEARCH_RESULT_ITEM_SPLIT_BUTTON_CLICKED = "QUICK_SEARCH_RESULT_ITEM_SPLIT_BUTTON_CLICKED";
export const CSS_PROPERTY_CHANGE_COMPLETED = "CSS_PROPERTY_CHANGE_COMPLETED";
export const CSS_PROPERTIES_CHANGE_COMPLETED = "CSS_PROPERTIES_CHANGE_COMPLETED";
export const ATTRIBUTE_CHANGED = "ATTRIBUTE_CHANGED";
export const SLOT_TOGGLE_CLICK = "SLOT_TOGGLE_CLICK";
export const TEXT_VALUE_CHANGED = "TEXT_VALUE_CHANGED";
export const ELEMENT_TYPE_CHANGED = "ELEMENT_TYPE_CHANGED";
export const FILE_ITEM_RIGHT_CLICKED = "FILE_ITEM_RIGHT_CLICKED";
export const CANVAS_RIGHT_CLICKED = "CANVAS_RIGHT_CLICKED";
export const PC_LAYER_RIGHT_CLICKED = "PC_LAYER_RIGHT_CLICKED";
export const PC_LAYER_DOUBLE_CLICKED = "PC_LAYER_DOUBLE_CLICKED";
export const SOURCE_INSPECTOR_LAYER_CLICKED = "SOURCE_INSPECTOR_LAYER_CLICKED";
export const SOURCE_INSPECTOR_LAYER_ARROW_CLICKED = "SOURCE_INSPECTOR_LAYER_ARROW_CLICKED";
export const SOURCE_INSPECTOR_LAYER_LABEL_CHANGED = "SOURCE_INSPECTOR_LAYER_LABEL_CHANGED";
export const SOURCE_INSPECTOR_LAYER_DROPPED = "SOURCE_INSPECTOR_LAYER_DROPPED";
export const NEW_FILE_ADDED = "NEW_FILE_ADDED";
export const QUICK_SEARCH_ITEM_CLICKED = "QUICK_SEARCH_ITEM_CLICKED";
export const QUICK_SEARCH_INPUT_ENTERED = "QUICK_SEARCH_INPUT_ENTERED";
export const QUICK_SEARCH_BACKGROUND_CLICK = "QUICK_SEARCH_BACKGROUND_CLICK";
export const NEW_VARIANT_NAME_ENTERED = "NEW_VARIANT_NAME_ENTERED";
export const COMPONENT_VARIANT_REMOVED = "COMPONENT_VARIANT_REMOVED";
export const COMPONENT_VARIANT_NAME_CHANGED = "COMPONENT_VARIANT_NAME_CHANGED";
export const COMPONENT_VARIANT_NAME_CLICKED = "COMPONENT_VARIANT_NAME_CLICKED";
export const OPEN_PROJECT_BUTTON_CLICKED = "OPEN_PROJECT_BUTTON_CLICKED";
export const CREATE_PROJECT_BUTTON_CLICKED = "CREATE_PROJECT_BUTTON_CLICKED";
export const OPEN_CONTROLLER_BUTTON_CLICKED = "OPEN_CONTROLLER_BUTTON_CLICKED";
export const ADD_COMPONENT_CONTROLLER_BUTTON_CLICKED = "ADD_COMPONENT_CONTROLLER_BUTTON_CLICKED";
export const REMOVE_COMPONENT_CONTROLLER_BUTTON_CLICKED = "REMOVE_COMPONENT_CONTROLLER_BUTTON_CLICKED";
export const COMPONENT_CONTROLLER_PICKED = "COMPONENT_CONTROLLER_PICKED";
export const COMPONENT_VARIANT_NAME_DEFAULT_TOGGLE_CLICK = "COMPONENT_VARIANT_NAME_DEFAULT_TOGGLE_CLICK";
export const ELEMENT_VARIANT_TOGGLED = "ELEMENT_VARIANT_TOGGLED";
export const CONFIRM_SAVE_CHANGES = "CONFIRM_SAVE_CHANGES";
export const CHROME_HEADER_MOUSE_DOWN = "CHROME_HEADER_MOUSE_DOWN";
export const CHROME_CLOSE_BUTTON_CLICKED = "CHROME_CLOSE_BUTTON_CLICKED";
export const CHROME_MINIMIZE_BUTTON_CLICKED = "CHROME_MINIMIZE_BUTTON_CLICKED";
export const CHROME_MAXIMIZE_BUTTON_CLICKED = "CHROME_MAXIMIZE_BUTTON_CLICKED";
export const CSS_RESET_PROPERTY_OPTION_CLICKED = "CSS_RESET_PROPERTY_OPTION_CLICKED";
export const IMAGE_BROWSE_BUTTON_CLICKED = "IMAGE_BROWSE_BUTTON_CLICKED";
export const BROWSE_DIRECTORY_CLICKED = "BROWSE_DIRECTORY_CLICKED";
export const IMAGE_SOURCE_INPUT_CHANGED = "IMAGE_SOURCE_INPUT_CHANGED";
export const IMAGE_PATH_PICKED = "IMAGE_PATH_PICKED";
export const DIRECTORY_PATH_PICKED = "DIRECTORY_PATH_PICKED";
export const CSS_INHERITED_FROM_LABEL_CLICKED = "CSS_INHERITED_FROM_LABEL_CLICKED";
export const CANVAS_TEXT_EDIT_CHANGE_COMPLETE = "CANVAS_TEXT_EDIT_CHANGE_COMPLETE";
export const ADD_VARIANT_TRIGGER_CLICKED = "ADD_VARIANT_TRIGGER_CLICKED";
export const REMOVE_VARIANT_TRIGGER_CLICKED = "REMOVE_VARIANT_TRIGGER_CLICKED";
export const VARIANT_TRIGGER_SOURCE_CHANGED = "VARIANT_TRIGGER_SOURCE_CHANGED";
export const VARIANT_TRIGGER_TARGET_CHANGED = "VARIANT_TRIGGER_TARGET_CHANGED";
export const ADD_QUERY_BUTTON_CLICKED = "ADD_QUERY_BUTTON_CLICKED";
export const REMOVE_MEDIA_QUERY_BUTTON_CLICK = "REMOVE_MEDIA_QUERY_BUTTON_CLICK";
export const QUERY_LABEL_CHANGED = "QUERY_LABEL_CHANGED";
export const QUERY_CONDITION_CHANGED = "QUERY_CONDITION_CHANGED";
export const QUERY_TYPE_CHANGED = "QUERY_TYPE_CHANGED";
export const VARIABLE_QUERY_SOURCE_VARIABLE_CHANGE = "VARIABLE_QUERY_SOURCE_VARIABLE_CHANGE";
export const BREAD_CRUMB_CLICKED = "BREAD_CRUMB_CLICKED";
export const BUILD_BUTTON_START_CLICKED = "BUILD_BUTTON_START_CLICKED";
export const BUILD_BUTTON_STOP_CLICKED = "BUILD_BUTTON_STOP_CLICKED";
export const BUILD_BUTTON_OPEN_APP_CLICKED = "BUILD_BUTTON_OPEN_APP_CLICKED";
export const BUILD_BUTTON_CONFIGURE_CLICKED = "BUILD_BUTTON_CONFIGURE_CLICKED";
export const CONFIGURE_BUILD_MODAL_X_CLICKED = "CONFIGURE_BUILD_MODAL_X_CLICKED";
export const CONFIGURE_BUILD_MODAL_BACKGROUND_CLICKED = "CONFIGURE_BUILD_MODAL_BACKGROUND_CLICKED";
export const SCRIPT_PROCESS_STARTED = "SCRIPT_PROCESS_STARTED";
export const SCRIPT_PROCESS_LOGGED = "SCRIPT_PROCESS_LOGGED";
export const SCRIPT_PROCESS_CLOSED = "SCRIPT_PROCESS_CLOSED";
export const BUILD_SCRIPT_STARTED = "BUILD_SCRIPT_STARTED";
export const CLOSE_BOTTOM_GUTTER_BUTTON_CLICKED = "CLOSE_BOTTOM_GUTTER_BUTTON_CLICKED";
export const BUILD_SCRIPT_CONFIG_CHANGED = "BUILD_SCRIPT_CONFIG_CHANGED";
export const OPEN_APP_SCRIPT_CONFIG_CHANGED = "OPEN_APP_SCRIPT_CONFIG_CHANGED";
export const UNLOADING = "UNLOADING";
export const UNLOADER_CREATED = "UNLOADER_CREATED";
export const UNLOADER_COMPLETED = "UNLOADER_COMPLETED";
export const RELOAD = "RELOAD";
export const LINK_CICKED = "LINK_CICKED";
export const quickSearchResultItemSplitButtonClick = (item) => ({
    item,
    type: QUICK_SEARCH_RESULT_ITEM_SPLIT_BUTTON_CLICKED
});
export const fileNavigatorDroppedItem = (node, targetNode, offset) => ({
    node,
    targetNode,
    offset,
    type: FILE_NAVIGATOR_DROPPED_ITEM
});
export const editorTabClicked = (event, uri) => ({
    uri,
    event,
    type: EDITOR_TAB_CLICKED
});
export const editorTabContextMenuOpenInBottomTabOptionClicked = publicActionCreator((uri) => ({
    type: EDITOR_TAB_CONTEXT_MENU_OPEN_IN_BOTTOM_OPTION_CLICKED,
    uri
}));
export const moduleContextMenuCloseOptionClicked = publicActionCreator((uri) => ({
    type: MODULE_CONTEXT_MENU_CLOSE_OPTION_CLICKED,
    uri
}));
export const editorTabRightClicked = (event, uri) => ({
    uri,
    event,
    type: EDITOR_TAB_RIGHT_CLICKED
});
export const fileItemContextMenuDeleteClicked = publicActionCreator((item) => ({
    item,
    type: FILE_ITEM_CONTEXT_MENU_DELETE_CLICKED
}));
export const fileItemContextMenuCopyPathClicked = publicActionCreator((item) => ({
    item,
    type: FILE_ITEM_CONTEXT_MENU_COPY_PATH_CLICKED
}));
export const variableQuerySourceVariableChange = (query, variable) => ({
    type: VARIABLE_QUERY_SOURCE_VARIABLE_CHANGE,
    query,
    variable
});
export const queryConditionChanged = (target, condition) => ({
    type: QUERY_CONDITION_CHANGED,
    target,
    condition
});
export const queryLabelChanged = (target, label) => ({
    type: QUERY_LABEL_CHANGED,
    target,
    label
});
export const breadCrumbClicked = (node) => ({
    type: BREAD_CRUMB_CLICKED,
    node
});
export const queryTypeChanged = (target, newType) => ({
    type: QUERY_TYPE_CHANGED,
    target,
    newType
});
export const fileItemContextMenuRenameClicked = publicActionCreator((item) => ({
    item,
    type: FILE_ITEM_CONTEXT_MENU_RENAME_CLICKED
}));
export const fileItemContextMenuCreateDirectoryClicked = publicActionCreator((item) => ({
    item,
    type: FILE_ITEM_CONTEXT_MENU_CREATE_DIRECTORY_CLICKED
}));
export const fileItemContextMenuCreateBlankFileClicked = publicActionCreator((item) => ({
    item,
    type: FILE_ITEM_CONTEXT_MENU_CREATE_BLANK_FILE_CLICKED
}));
export const fileItemContextMenuCreateComponentFileClicked = publicActionCreator((item) => ({
    item,
    type: FILE_ITEM_CONTEXT_MENU_CREATE_COMPONENT_FILE_CLICKED
}));
export const linkClicked = (url) => ({
    url,
    type: LINK_CICKED
});
export const fileItemContextMenuOpenClicked = publicActionCreator((item) => ({
    item,
    type: FILE_ITEM_CONTEXT_MENU_OPEN_CLICKED
}));
export const buildButtonStartClicked = () => ({
    type: BUILD_BUTTON_START_CLICKED
});
export const buildButtonConfigureClicked = () => ({
    type: BUILD_BUTTON_CONFIGURE_CLICKED
});
export const buildButtonStopClicked = () => ({
    type: BUILD_BUTTON_STOP_CLICKED
});
export const buildButtonOpenAppClicked = () => ({
    type: BUILD_BUTTON_OPEN_APP_CLICKED
});
export const configureBuildModalXClicked = () => ({
    type: CONFIGURE_BUILD_MODAL_X_CLICKED
});
export const buildScriptConfigChanged = (script) => ({
    type: BUILD_SCRIPT_CONFIG_CHANGED,
    script
});
export const openAppScriptConfigChanged = (script) => ({
    type: OPEN_APP_SCRIPT_CONFIG_CHANGED,
    script
});
export const configureBuildModalBackgroundClicked = () => ({
    type: CONFIGURE_BUILD_MODAL_BACKGROUND_CLICKED
});
export const unloading = () => ({
    type: UNLOADING
});
export const unloaderCreated = (unloader) => ({
    unloader,
    type: UNLOADER_CREATED
});
export const unloaderCompleted = (unloader) => ({
    unloader,
    type: UNLOADER_COMPLETED
});
export const addQueryButtonClick = (queryType) => ({
    type: ADD_QUERY_BUTTON_CLICKED,
    queryType
});
export const fileItemContextMenuOpenInFinderClicked = publicActionCreator((item) => ({
    item,
    type: FILE_ITEM_CONTEXT_MENU_OPEN_IN_FINDER_CLICKED
}));
export const inspectorNodeContextMenuWrapInElementClicked = publicActionCreator((item) => ({
    type: INSPECTOR_NODE_CONTEXT_MENU_WRAP_IN_ELEMENT_CLICKED,
    item
}));
export const inspectorNodeContextMenuConvertToComponentClicked = publicActionCreator((item) => ({
    type: INSPECTOR_NODE_CONTEXT_MENU_CONVERT_TO_COMPONENT_CLICKED,
    item
}));
export const imageBrowseButtonClicked = publicActionCreator(() => ({
    type: IMAGE_BROWSE_BUTTON_CLICKED
}));
export const browseDirectoryClicked = publicActionCreator(() => ({
    type: BROWSE_DIRECTORY_CLICKED
}));
export const buildScriptStarted = (process) => ({
    type: BUILD_SCRIPT_STARTED,
    process
});
export const reload = () => ({
    type: RELOAD
});
export const canvasTextEditChangeComplete = (value) => ({
    value,
    type: CANVAS_TEXT_EDIT_CHANGE_COMPLETE
});
export const cssInheritedFromLabelClicked = (inheritedFromNode) => ({
    type: CSS_INHERITED_FROM_LABEL_CLICKED,
    inheritedFromNode
});
export const imageSourceInputChanged = (value) => ({
    value,
    type: IMAGE_SOURCE_INPUT_CHANGED
});
export const inspectorNodeContextMenuConvertToStyleMixinClicked = publicActionCreator((item) => ({
    type: INSPECTOR_NODE_CONTEXT_MENU_CONVERT_TO_STYLE_MIXIN_CLICKED,
    item
}));
export const inspectorNodeContextMenuConvertTextStylesToMixinClicked = publicActionCreator((item) => ({
    type: INSPECTOR_NODE_CONTEXT_MENU_CONVERT_TEXT_STYLES_TO_MIXIN_CLICKED,
    item
}));
export const inspectorNodeContextMenuRemoveClicked = publicActionCreator((item) => ({
    type: INSPECTOR_NODE_CONTEXT_MENU_REMOVE_CLICKED,
    item
}));
export const inspectorNodeContextMenuRenameClicked = publicActionCreator((item) => ({
    type: INSPECTOR_NODE_CONTEXT_MENU_RENAME_CLICKED,
    item
}));
export const inspectorNodeContextMenuCopyClicked = publicActionCreator((item) => ({
    type: INSPECTOR_NODE_CONTEXT_MENU_COPY_CLICKED,
    item
}));
export const inspectorNodeContextMenuPasteClicked = publicActionCreator((item) => ({
    type: INSPECTOR_NODE_CONTEXT_MENU_PASTE_CLICKED,
    item
}));
export const inspectorNodeContextMenuWrapInSlotClicked = publicActionCreator((item) => ({
    type: INSPECTOR_NODE_CONTEXT_MENU_WRAP_IN_SLOT_CLICKED,
    item
}));
export const inspectorNodeContextMenuSelectParentClicked = publicActionCreator((item) => ({
    type: INSPECTOR_NODE_CONTEXT_MENU_SELECT_PARENT_CLICKED,
    item
}));
export const inspectorNodeContextMenuSelectSourceNodeClicked = publicActionCreator((item) => ({
    type: INSPECTOR_NODE_CONTEXT_MENU_SELECT_SOURCE_NODE_CLICKED,
    item
}));
export const inspectorNodeContextMenuShowInCanvasClicked = publicActionCreator((item) => ({
    type: INSPECTOR_NODE_CONTEXT_MENU_SHOW_IN_CANVAS_CLICKED,
    item
}));
export const cssResetPropertyOptionClicked = (property) => ({
    type: CSS_RESET_PROPERTY_OPTION_CLICKED,
    property
});
export const editorTabCloseButtonClicked = (event, uri) => ({
    uri,
    event,
    type: EDITOR_TAB_CLOSE_BUTTON_CLICKED
});
export const fileNavigatorItemClicked = (node) => ({
    node,
    type: FILE_NAVIGATOR_ITEM_CLICKED
});
export const fileNavigatorToggleDirectoryClicked = (node) => ({
    node,
    type: FILE_NAVIGATOR_TOGGLE_DIRECTORY_CLICKED
});
export const fileNavigatorBasenameChanged = (basename, item) => ({
    item,
    basename,
    type: FILE_NAVIGATOR_BASENAME_CHANGED
});
export const scriptProcessStarted = (process) => ({
    type: SCRIPT_PROCESS_STARTED,
    process
});
export const scriptProcessLog = (process, log) => ({
    type: SCRIPT_PROCESS_LOGGED,
    process,
    log
});
export const scriptProcessStopped = (process) => ({
    type: SCRIPT_PROCESS_CLOSED,
    process
});
export const promptConfirmed = (inputValue, actionType) => ({
    inputValue,
    type: actionType
});
export const exportNameChanged = (value) => ({
    type: EXPORT_NAME_CHANGED,
    value
});
export const promptCancelButtonClicked = () => ({
    type: PROMPT_CANCEL_BUTTON_CLICKED
});
export const openTextEditorButtonClicked = publicActionCreator((uri) => ({
    uri,
    type: OPEN_TEXT_EDITOR_BUTTON_CLICKED
}));
export const newFileAdded = (uri, fileType) => ({
    uri,
    fileType,
    type: NEW_FILE_ADDED
});
export const elementVariantToggled = (newVariants, node) => ({
    newVariants,
    node,
    type: ELEMENT_VARIANT_TOGGLED
});
export const closeBottomGutterButtonClicked = () => ({
    type: CLOSE_BOTTOM_GUTTER_BUTTON_CLICKED
});
export const fileNavigatorNewFileClicked = (fileType) => ({
    fileType,
    type: FILE_NAVIGATOR_NEW_FILE_CLICKED
});
export const styleVariantDropdownChanged = (variant, component) => ({
    type: STYLE_VARIANT_DROPDOWN_CHANGED,
    component,
    variant
});
export const addVariableButtonClicked = (variableType) => ({
    variableType,
    type: ADD_VARIABLE_BUTTON_CLICKED
});
export const variableLabelChangeCompleted = (variable, value) => ({
    variable,
    type: VARIABLE_LABEL_CHANGE_COMPLETED,
    value
});
export const variableValueChanged = (variable, value) => ({
    variable,
    type: VARIABLE_VALUE_CHANGED,
    value
});
export const variableValueChangeCompleted = (variable, value) => ({
    variable,
    type: VARIABLE_VALUE_CHANGE_COMPLETED,
    value
});
export const newStyleVariantButtonClicked = () => ({
    type: NEW_STYLE_VARIANT_BUTTON_CLICKED
});
export const projectDirectoryDirLoaded = (items) => ({
    type: PROJECT_DIRECTORY_DIR_LOADED,
    items
});
export const removeStyleButtonClicked = () => ({
    type: REMOVE_STYLE_BUTTON_CLICKED
});
export const editVariantNameButtonClicked = () => ({
    type: EDIT_VARIANT_NAME_BUTTON_CLICKED
});
export const addStyleButtonClicked = () => ({
    type: ADD_STYLE_BUTTON_CLICKED
});
export const fileNavigatorNewDirectoryClicked = () => ({
    type: FILE_NAVIGATOR_NEW_DIRECTORY_CLICKED
});
export const openProjectButtonClicked = publicActionCreator(() => ({
    type: OPEN_PROJECT_BUTTON_CLICKED
}));
export const createProjectButtonClicked = publicActionCreator((directory, files) => ({
    directory,
    type: CREATE_PROJECT_BUTTON_CLICKED,
    files
}));
export const inheritPaneAddButtonClick = () => ({
    type: INHERIT_PANE_ADD_BUTTON_CLICK
});
export const inheritPaneRemoveButtonClick = (componentId) => ({
    componentId,
    type: INHERIT_PANE_REMOVE_BUTTON_CLICK
});
export const projectInfoLoaded = (info) => ({
    type: PROJECT_INFO_LOADED,
    info
});
export const inheritItemComponentTypeChangeComplete = (oldComponentId, newComponentId) => ({
    oldComponentId,
    newComponentId,
    type: INHERIT_ITEM_COMPONENT_TYPE_CHANGE_COMPLETE
});
export const componentPickerBackgroundClick = () => ({
    type: COMPONENT_PICKER_BACKGROUND_CLICK
});
export const addVariantButtonClicked = () => ({
    type: ADD_VARIANT_BUTTON_CLICKED
});
export const addVariantTriggerButtonClicked = () => ({
    type: ADD_VARIANT_TRIGGER_CLICKED
});
export const variantTriggerSourceChanged = (trigger, value) => ({
    type: VARIANT_TRIGGER_SOURCE_CHANGED,
    value,
    trigger
});
export const variantTriggerTargetChanged = (trigger, value) => ({
    type: VARIANT_TRIGGER_TARGET_CHANGED,
    value,
    trigger
});
export const removeVariantTriggerButtonClicked = (trigger) => ({
    trigger,
    type: REMOVE_VARIANT_TRIGGER_CLICKED
});
export const fileItemRightClicked = (item, event) => ({
    type: FILE_ITEM_RIGHT_CLICKED,
    event,
    item
});
export const canvasRightClicked = (event) => ({
    type: CANVAS_RIGHT_CLICKED,
    event
});
export const pcLayerRightClicked = (item, event) => ({
    item,
    type: PC_LAYER_RIGHT_CLICKED,
    event
});
export const pcLayerDoubleClicked = (item, event) => ({
    item,
    type: PC_LAYER_DOUBLE_CLICKED,
    event
});
export const unhandledError = (error) => ({
    error,
    type: UNHANDLED_ERROR
});
export const removeVariantButtonClicked = () => ({
    type: REMOVE_VARIANT_BUTTON_CLICKED
});
export const quickSearchFilterChanged = (value) => ({
    type: QUICK_SEARCH_FILTER_CHANGED,
    value
});
export const quickSearchFilterResultLoaded = (matches) => ({
    matches,
    type: QUICK_SEARCH_RESULT_LOADED
});
export const variantDefaultSwitchClicked = (variant) => ({
    variant,
    type: VARIANT_DEFAULT_SWITCH_CLICKED
});
export const instanceVariantToggled = (variant) => ({
    variant,
    type: COMPONENT_INSTANCE_VARIANT_TOGGLED
});
export const instanceVariantResetClicked = (variant) => ({
    variant,
    type: INSTANCE_VARIANT_RESET_CLICKED
});
export const variantLabelChanged = (variant, newLabel) => ({
    variant,
    newLabel,
    type: VARIANT_LABEL_CHANGED
});
export const componentPickerItemClick = (component) => ({
    component,
    type: COMPONENT_PICKER_ITEM_CLICK
});
export const quickSearchItemClicked = (item) => ({
    item,
    type: QUICK_SEARCH_ITEM_CLICKED
});
export const quickSearchInputEntered = (item) => ({
    item,
    type: QUICK_SEARCH_INPUT_ENTERED
});
export const openControllerButtonClicked = (relativePath) => ({
    relativePath,
    type: OPEN_CONTROLLER_BUTTON_CLICKED
});
export const addComponentControllerButtonClicked = publicActionCreator((defaultPath) => ({
    defaultPath,
    type: ADD_COMPONENT_CONTROLLER_BUTTON_CLICKED
}));
export const removeComponentControllerButtonClicked = (relativePath) => ({
    relativePath,
    type: REMOVE_COMPONENT_CONTROLLER_BUTTON_CLICKED
});
export const componentControllerPicked = (filePath) => ({
    filePath,
    type: COMPONENT_CONTROLLER_PICKED
});
export const quickSearchBackgroundClick = () => ({
    type: QUICK_SEARCH_BACKGROUND_CLICK
});
export const fileNavigatorNewFileEntered = (basename, insertType, directoryId) => ({
    basename,
    directoryId,
    insertType,
    type: FILE_NAVIGATOR_NEW_FILE_ENTERED
});
export const openFilesItemClick = (uri, sourceEvent) => ({
    uri,
    sourceEvent,
    type: OPEN_FILE_ITEM_CLICKED
});
export const openFilesItemCloseClick = (uri) => ({
    uri,
    sourceEvent: null,
    type: OPEN_FILE_ITEM_CLOSE_CLICKED
});
export const activeEditorUriDirsLoaded = () => ({
    type: ACTIVE_EDITOR_URI_DIRS_LOADED
});
export const frameModeChangeComplete = (frame, mode) => ({
    type: FRAME_MODE_CHANGE_COMPLETE,
    frame,
    mode
});
export const toolbarToolClicked = (toolType) => ({
    type: TOOLBAR_TOOL_CLICKED,
    toolType
});
export const fileNavigatorItemDoubleClicked = (node) => ({
    node,
    type: FILE_NAVIGATOR_ITEM_DOUBLE_CLICKED
});
export const fileNavigatorItemBlurred = (node) => ({
    node,
    type: FILE_NAVIGATOR_ITEM_BLURRED
});
export const sourceInspectorLayerClicked = (node, sourceEvent) => ({
    type: SOURCE_INSPECTOR_LAYER_CLICKED,
    node,
    sourceEvent
});
export const sourceInspectorLayerArrowClicked = (node, sourceEvent) => ({
    type: SOURCE_INSPECTOR_LAYER_ARROW_CLICKED,
    node,
    sourceEvent
});
export const sourceInspectorLayerLabelChanged = (node, label, sourceEvent) => ({
    type: SOURCE_INSPECTOR_LAYER_LABEL_CHANGED,
    node,
    label,
    sourceEvent
});
export const newVariantNameEntered = (value) => ({
    value,
    type: NEW_VARIANT_NAME_ENTERED
});
export const componentComponentVariantNameChanged = (oldName, newName) => ({
    oldName,
    newName,
    type: COMPONENT_VARIANT_NAME_CHANGED
});
export const componentComponentVariantNameClicked = (name) => ({
    name,
    type: COMPONENT_VARIANT_NAME_CLICKED
});
export const componentVariantNameDefaultToggleClick = (name, value) => ({
    name,
    value,
    type: COMPONENT_VARIANT_NAME_DEFAULT_TOGGLE_CLICK
});
export const sourceInspectorLayerDropped = (source, target, offset) => ({
    source,
    target,
    offset,
    type: SOURCE_INSPECTOR_LAYER_DROPPED
});
export const rawCssTextChanged = (value) => ({
    value,
    type: RAW_CSS_TEXT_CHANGED
});
export const cssPropertyChanged = (name, value) => ({
    name,
    value,
    type: CSS_PROPERTY_CHANGED
});
export const cssPropertiesChanged = (properties) => ({
    properties,
    type: CSS_PROPERTIES_CHANGED
});
export const cssPropertyChangeCompleted = (name, value) => ({
    name,
    value,
    type: CSS_PROPERTY_CHANGE_COMPLETED
});
export const cssPropertiesChangeCompleted = (properties) => ({
    properties,
    type: CSS_PROPERTIES_CHANGE_COMPLETED
});
export const attributeChanged = (name, value) => ({
    name,
    value,
    type: ATTRIBUTE_CHANGED
});
export const slotToggleClick = () => ({
    type: SLOT_TOGGLE_CLICK
});
export const textValueChanged = (value) => ({
    value,
    type: TEXT_VALUE_CHANGED
});
export const elementTypeChanged = (value) => ({
    value,
    type: ELEMENT_TYPE_CHANGED
});
export const appLoaded = publicActionCreator(() => ({ type: APP_LOADED }));
export const newFileEntered = (basename) => ({
    basename,
    type: NEW_FILE_ENTERED
});
export const newDirectoryEntered = (basename) => ({
    basename,
    type: NEW_DIRECTORY_ENTERED
});
export const projectLoaded = (uri) => ({
    uri,
    type: PROJECT_LOADED
});
export const projectDirectoryLoaded = publicActionCreator((directory) => ({
    directory,
    type: PROJECT_DIRECTORY_LOADED
}));
export const shortcutKeyDown = publicActionCreator((type) => ({
    type
}));
export const inspectorNodePasted = (clips) => ({
    clips,
    type: INSPECTOR_NODES_PASTED
});
export const documentRendered = (documentId, info, nativeMap) => ({
    nativeMap,
    documentId,
    info,
    type: DOCUMENT_RENDERED
});
export const savedFile = (uri) => ({
    uri,
    type: SAVED_FILE
});
export const savedAllFiles = (uri) => ({
    type: SAVED_ALL_FILES
});
export const canvasToolOverlayMousePanStart = (documentId) => ({
    documentId,
    type: CANVAS_TOOL_OVERLAY_MOUSE_PAN_START
});
export const canvasToolOverlayMousePanning = (documentId, center, deltaY, velocityY) => ({
    documentId,
    center,
    deltaY,
    velocityY,
    type: CANVAS_TOOL_OVERLAY_MOUSE_PANNING
});
export const canvasToolOverlayMouseLeave = (sourceEvent) => ({
    type: CANVAS_TOOL_OVERLAY_MOUSE_LEAVE,
    sourceEvent
});
export const canvasToolOverlayMousePanEnd = (documentId) => ({
    documentId,
    type: CANVAS_TOOL_OVERLAY_MOUSE_PAN_END
});
export const canvasToolOverlayMouseDoubleClicked = (documentId, sourceEvent) => ({
    documentId,
    type: CANVAS_TOOL_OVERLAY_MOUSE_DOUBLE_CLICKED,
    sourceEvent
});
export const canvasContainerMounted = (element, fileUri) => ({
    element,
    fileUri,
    type: CANVAS_MOUNTED
});
export const canvasMouseMoved = (editorWindow, sourceEvent) => ({
    editorWindow,
    sourceEvent,
    type: CANVAS_MOUSE_MOVED
});
export const canvasDraggedOver = (item, offset) => ({
    item,
    offset,
    type: CANVAS_DRAGGED_OVER
});
export const canvasMouseClicked = (sourceEvent) => ({
    sourceEvent,
    type: CANVAS_MOUSE_CLICKED
});
export const canvasMouseDoubleClicked = (sourceEvent) => ({
    sourceEvent,
    type: CANVAS_MOUSE_DOUBLE_CLICKED
});
export const canvasWheel = (canvasWidth, canvasHeight, { metaKey, ctrlKey, deltaX, deltaY, clientX, clientY }) => ({
    metaKey,
    canvasWidth,
    canvasHeight,
    ctrlKey,
    deltaX,
    deltaY,
    type: CANVAS_WHEEL
});
export const canvasDroppedItem = (item, point, editorUri) => ({
    editorUri,
    item,
    point,
    type: CANVAS_DROPPED_ITEM
});
export const canvasMotionRested = () => ({
    type: CANVAS_MOTION_RESTED
});
export const insertToolFinished = (point, fileUri) => ({
    point,
    fileUri,
    type: INSERT_TOOL_FINISHED
});
export const canvasToolWindowBackgroundClicked = (sourceEvent) => ({
    type: CANVAS_TOOL_WINDOW_BACKGROUND_CLICKED,
    sourceEvent
});
export const canvasToolWindowKeyDown = (documentId, sourceEvent) => ({
    type: CANVAS_TOOL_WINDOW_KEY_DOWN,
    documentId,
    sourceEvent
});
export const canvasToolDocumentTitleClicked = (frame, sourceEvent) => ({
    type: CANVAS_TOOL_ARTBOARD_TITLE_CLICKED,
    frame,
    sourceEvent
});
export const canvasToolPreviewButtonClicked = (frame, sourceEvent) => ({
    type: CANVAS_TOOL_PREVIEW_BUTTON_CLICKED,
    frame,
    sourceEvent
});
export const resizerPathMoved = (anchor, originalBounds, newBounds, sourceEvent) => ({
    type: RESIZER_PATH_MOUSE_MOVED,
    anchor,
    originalBounds,
    newBounds,
    sourceEvent
});
export const frameBoundsChanged = (newBounds) => ({
    type: FRAME_BOUNDS_CHANGED,
    newBounds
});
export const frameBoundsChangeCompleted = (newBounds) => ({
    type: FRAME_BOUNDS_CHANGE_COMPLETED,
    newBounds
});
export const resizerPathStoppedMoving = (anchor, originalBounds, newBounds, sourceEvent) => ({
    type: RESIZER_PATH_MOUSE_STOPPED_MOVING,
    anchor,
    originalBounds,
    newBounds,
    sourceEvent: Object.assign({}, sourceEvent)
});
export const resizerMoved = (point) => ({
    point,
    type: RESIZER_MOVED
});
export const resizerStoppedMoving = (point) => ({
    point,
    type: RESIZER_STOPPED_MOVING
});
export const resizerMouseDown = (sourceEvent) => ({
    sourceEvent,
    type: RESIZER_MOUSE_DOWN
});
export const resizerStartDrag = (sourceEvent) => ({
    sourceEvent,
    type: RESIZER_START_DRGG
});
//# sourceMappingURL=index.js.map