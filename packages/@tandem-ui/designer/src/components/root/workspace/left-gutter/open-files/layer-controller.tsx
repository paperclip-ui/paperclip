import * as React from "react";
import * as ReactDOM from "react-dom";
import * as path from "path";
import scrollIntoView from "scroll-into-view-if-needed";
import { FocusComponent } from "../../../../focus";
import cx from "classnames";
import { compose } from "recompose";
import { DragSource } from "react-dnd";
import { withNodeDropTarget } from "./dnd-controller";
import { BeforeDropZone, AfterDropZone } from "./drop-zones.pc";
import {
  PCSourceTagNames,
  getPCNode,
  PCVisibleNode,
  getPCNodeDependency,
  PCElementLikeNode,
  getPCNodeContentNode,
  getNativeComponentName,
  PCModule,
  getPCNodeModule,
} from "@paperclip-lang/core";
import { InspectorNode, InspectorTreeNodeName } from "@paperclip-lang/core";
import { Dispatch } from "redux";
import {
  sourceInspectorLayerClicked,
  sourceInspectorLayerArrowClicked,
  sourceInspectorLayerLabelChanged,
  pcLayerRightClicked,
  pcLayerDoubleClicked,
} from "../../../../../actions";
import {
  containsNestedTreeNodeById,
  mouseEventToPoint,
  TreeMoveOffset,
} from "tandem-common";
import { BaseNodeLayerProps } from "./layer.pc";
import { withLayersPaneContext, LayersPaneContextProps } from "./contexts";
import { getInspectorContentNodeContainingChild } from "@paperclip-lang/core";

export type Props = {
  depth?: number;
  inShadow?: boolean;
  inspectorNode: InspectorNode;
  first?: boolean;
  last?: boolean;
};

type ContextProps = {
  isSelected: boolean;
  editingLabel: boolean;
  isHovering: boolean;
  dispatch: Dispatch<any>;
  label: string;
};

type InnerProps = {
  editingLabel: boolean;
  isOver: boolean;
  canDrop: boolean;
  onLabelClick: () => any;
  nativeTagName: string;
  connectDragSource?: any;
  connectDropTarget?: any;
  onLabelRightClick: () => any;
  onLabelDoubleClick: () => any;
  onArrowButtonClick: () => any;
  onLabelInputKeyDown: () => any;
  onLabelInputBlur: () => any;
  assocSourceNodeName: string;
} & ContextProps &
  Props;

const DRAG_TYPE = "INSPECTOR_NODE";

const LAYER_PADDING = 16;
const DROP_ZONE_PADDING = LAYER_PADDING + 4;

const CONTAINER_STYLE = {
  display: "inline-block",
  minWidth: "100%",
};

export default (Base: React.ComponentClass<BaseNodeLayerProps>) => {
  let EnhancedLayer: React.ComponentClass<Props>;

  const enhance = compose<BaseNodeLayerProps, Props>(
    withLayersPaneContext<ContextProps, Props>(
      (
        { inspectorNode }: Props,
        {
          graph,
          selectedInspectorNodes,
          hoveringInspectorNodes,
          dispatch,
          renameInspectorNodeId,
          rootInspectorNode,
        }: LayersPaneContextProps
      ) => {
        const assocSourceNode = getPCNode(
          inspectorNode.name === InspectorTreeNodeName.CONTENT
            ? inspectorNode.sourceSlotNodeId
            : inspectorNode.sourceNodeId,
          graph
        );

        const nativeTagName = getNativeComponentName(
          assocSourceNode as PCElementLikeNode,
          graph
        );

        let label = assocSourceNode && (assocSourceNode as PCVisibleNode).label;

        // note that "Layer" is used as a default label here
        // to show layers that have an undefined label (which shouldn't exist)
        if (!label) {
          if (assocSourceNode.name === PCSourceTagNames.MODULE) {
            const dependency = getPCNodeDependency(
              inspectorNode.sourceNodeId,
              graph
            );
            label = path.basename(dependency.uri);
          } else if (assocSourceNode.name === PCSourceTagNames.ELEMENT) {
            label = assocSourceNode.is || "Layer";
          } else if (
            assocSourceNode.name === PCSourceTagNames.COMPONENT_INSTANCE
          ) {
            label = "Layer";
          } else if (assocSourceNode.name === PCSourceTagNames.TEXT) {
            label = "Layer";
          } else if (assocSourceNode.name === PCSourceTagNames.COMPONENT) {
            label = "Layer";
          } else if (assocSourceNode.name === PCSourceTagNames.SLOT) {
            label = assocSourceNode.label;
          }
        }

        return {
          dispatch,
          nativeTagName,
          editingLabel: renameInspectorNodeId === inspectorNode.id,
          isSelected:
            selectedInspectorNodes
              .map((node) => node.id)
              .indexOf(inspectorNode.id) !== -1,
          isHovering:
            hoveringInspectorNodes
              .map((node) => node.id)
              .indexOf(inspectorNode.id) !== -1,
          label,
          graph,
          inspectorNode,
          contentNode: getInspectorContentNodeContainingChild(
            inspectorNode,
            rootInspectorNode
          ),
          assocSourceNodeName: assocSourceNode.name,
        };
      }
    ),

    withNodeDropTarget(TreeMoveOffset.PREPEND),
    DragSource(
      DRAG_TYPE,
      {
        beginDrag({ inspectorNode }: InnerProps) {
          return inspectorNode;
        },
        canDrag({ inspectorNode, graph }: any) {
          const sourceNode = getPCNode(inspectorNode.sourceNodeId, graph);
          const module = getPCNodeModule(
            inspectorNode.sourceNodeId,
            graph
          ) as PCModule;
          const contentSourceNode = getPCNodeContentNode(
            inspectorNode.sourceNodeId,
            module
          );
          const canDrag =
            contentSourceNode &&
            containsNestedTreeNodeById(sourceNode.id, contentSourceNode);
          return canDrag;
        },
      },
      (connect, monitor) => ({
        connectDragSource: connect.dragSource(),
        connectDragPreview: connect.dragPreview(),
        isDragging: monitor.isDragging(),
      })
    ),
    (Base) => {
      return class LayerController extends React.Component<InnerProps, any> {
        onLabelClick = (event) => {
          this.props.dispatch(
            sourceInspectorLayerClicked(this.props.inspectorNode, event)
          );
        };
        onArrowButtonClick = (event) => {
          event.stopPropagation();
          this.props.dispatch(
            sourceInspectorLayerArrowClicked(this.props.inspectorNode, event)
          );
        };
        onLabelDoubleClick = (event) => {
          if (
            this.props.inspectorNode.name === InspectorTreeNodeName.SOURCE_REP
          ) {
            this.props.dispatch(
              pcLayerDoubleClicked(this.props.inspectorNode, event)
            );
          }
        };
        onLabelRightClick = (event: React.MouseEvent<any>) => {
          event.preventDefault();
          this.props.dispatch(
            pcLayerRightClicked(
              this.props.inspectorNode,
              mouseEventToPoint(event.nativeEvent)
            )
          );
        };
        onLabelInputKeyDown = (event) => {
          if (event.key === "Enter") {
            this.persistLabelChange(event);
          }
        };
        onLabelInputBlur = (event) => {
          this.persistLabelChange(event);
        };
        private persistLabelChange = (event) => {
          const label = String((event.target as any).value || "").trim();
          if (!label) {
            return;
          }
          this.props.dispatch(
            sourceInspectorLayerLabelChanged(
              this.props.inspectorNode,
              label,
              event
            )
          );
        };
        componentDidMount() {
          this.makeVisible(this.props.isSelected);
        }
        componentDidUpdate(prevProps: InnerProps) {
          this.makeVisible(this.props.isSelected && !prevProps.isSelected);
        }
        private makeVisible(selected: boolean) {
          if (selected) {
            const self = ReactDOM.findDOMNode(this) as HTMLSpanElement;

            setTimeout(() => {
              const label = self.children[1].children[0].children[1];
              // icky, but we're picking the label here
              scrollIntoView(label, {
                scrollMode: "if-needed",
              });
            }, 10);
          }
        }
        shouldComponentUpdate(nextProps: InnerProps) {
          return (
            this.props.depth !== nextProps.depth ||
            this.props.first !== nextProps.first ||
            this.props.last !== nextProps.last ||
            this.props.isSelected !== nextProps.isSelected ||
            this.props.isHovering !== nextProps.isHovering ||
            this.props.isOver !== nextProps.isOver ||
            this.props.canDrop !== nextProps.canDrop ||
            this.props.inspectorNode !== nextProps.inspectorNode ||
            this.props.connectDragSource !== nextProps.connectDragSource ||
            this.props.label !== nextProps.label ||
            this.props.connectDropTarget !== nextProps.connectDropTarget ||
            this.props.inShadow !== nextProps.inShadow ||
            this.props.assocSourceNodeName !== nextProps.assocSourceNodeName ||
            this.props.editingLabel !== nextProps.editingLabel ||
            this.props.nativeTagName !== nextProps.nativeTagName
          );
        }
        render() {
          const {
            depth,
            isSelected,
            isHovering,
            nativeTagName,
            isOver,
            canDrop,
            inspectorNode,
            connectDragSource,
            label,
            first,
            last,
            connectDropTarget,
            inShadow,
            editingLabel,
            assocSourceNodeName,
          } = this.props;
          const {
            onLabelClick,
            onArrowButtonClick,
            onLabelDoubleClick,
            onLabelRightClick,
            onLabelInputKeyDown,
            onLabelInputBlur,
          } = this;
          return (
            <Base
              first={first}
              last={last}
              onLabelClick={onLabelClick}
              onArrowButtonClick={onArrowButtonClick}
              onLabelDoubleClick={onLabelDoubleClick}
              onLabelRightClick={onLabelRightClick}
              onLabelInputKeyDown={onLabelInputKeyDown}
              onLabelInputBlur={onLabelInputBlur}
              editingLabel={editingLabel}
              nativeTagName={nativeTagName}
              depth={depth}
              isSelected={isSelected}
              isHovering={isHovering}
              connectDragSource={connectDragSource}
              isOver={isOver}
              canDrop={canDrop}
              inspectorNode={inspectorNode}
              label={label}
              connectDropTarget={connectDropTarget}
              inShadow={inShadow}
              assocSourceNodeName={assocSourceNodeName}
            />
          );
        }
      };
    },
    (Base: React.ComponentClass<BaseNodeLayerProps>) =>
      ({
        depth = 1,
        onLabelClick,
        editingLabel,
        isSelected,
        isHovering,
        isOver,
        canDrop,
        inspectorNode,
        nativeTagName,
        onArrowButtonClick,
        onLabelDoubleClick,
        onLabelRightClick,
        onLabelInputKeyDown,
        onLabelInputBlur,
        connectDragSource,
        label,
        first,
        last,
        connectDropTarget,
        inShadow,
        assocSourceNodeName,
      }: InnerProps) => {
        const expanded = inspectorNode.expanded;
        const isSourceRep =
          inspectorNode.name === InspectorTreeNodeName.SOURCE_REP;
        inShadow =
          inShadow || inspectorNode.name === InspectorTreeNodeName.SHADOW;
        let children;

        isHovering = isHovering || (canDrop && isOver);

        if (expanded) {
          const childDepth = depth + 1;
          children = inspectorNode.children.map((child, i) => {
            return (
              <EnhancedLayer
                first={i === 0}
                last={i === inspectorNode.children.length}
                inShadow={inShadow}
                key={child.id + i}
                depth={childDepth}
                inspectorNode={child}
              />
            );
          });
        }

        const dropZoneStyle = {
          width: `calc(100% - ${depth * DROP_ZONE_PADDING}px)`,
        };

        const isFile =
          isSourceRep && assocSourceNodeName === PCSourceTagNames.MODULE;

        return (
          <span style={CONTAINER_STYLE}>
            <BeforeDropZone
              style={{ ...dropZoneStyle, display: first ? "block" : "none" }}
              inspectorNode={inspectorNode}
            />
            <FocusComponent focus={editingLabel}>
              {connectDropTarget(
                connectDragSource(
                  <div title={nativeTagName}>
                    <Base
                      onClick={onLabelClick}
                      onDoubleClick={onLabelDoubleClick}
                      onContextMenu={onLabelRightClick}
                      labelInputProps={{
                        onKeyDown: onLabelInputKeyDown,
                        onBlur: onLabelInputBlur,
                        defaultValue: label,
                      }}
                      variant={cx({
                        editingLabel: editingLabel,
                        header: isFile,
                        pcLayer: isFile,
                        component:
                          isSourceRep &&
                          assocSourceNodeName === PCSourceTagNames.COMPONENT,
                        instance:
                          isSourceRep &&
                          assocSourceNodeName ===
                            PCSourceTagNames.COMPONENT_INSTANCE,
                        element:
                          isSourceRep &&
                          assocSourceNodeName === PCSourceTagNames.ELEMENT,
                        text:
                          isSourceRep &&
                          assocSourceNodeName === PCSourceTagNames.TEXT,
                        styleMixin:
                          isSourceRep &&
                          assocSourceNodeName === PCSourceTagNames.STYLE_MIXIN,
                        expanded,
                        selected: isSelected,
                        slot:
                          inspectorNode.name ===
                            InspectorTreeNodeName.SOURCE_REP &&
                          assocSourceNodeName === PCSourceTagNames.SLOT,
                        plug:
                          inspectorNode.name === InspectorTreeNodeName.CONTENT,
                        alt: inspectorNode.alt && !isSelected,
                        content:
                          inspectorNode.name === InspectorTreeNodeName.CONTENT,
                        shadow:
                          inspectorNode.name === InspectorTreeNodeName.SHADOW,
                        hover: isHovering,
                        inShadow: !isSelected && inShadow,
                      })}
                      arrowProps={{
                        onClick: onArrowButtonClick,
                      }}
                      labelProps={{
                        text: label,
                      }}
                      style={{ paddingLeft: depth * LAYER_PADDING }}
                    />
                  </div>
                )
              )}
            </FocusComponent>
            {children}
            {expanded && children.length ? null : (
              <AfterDropZone
                style={dropZoneStyle}
                inspectorNode={inspectorNode}
              />
            )}
          </span>
        );
      }
  );

  return (EnhancedLayer = enhance(Base));
};
