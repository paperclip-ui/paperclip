import React, { useRef, useState } from "react";
import * as styles from "@paperclip-ui/designer/src/styles/resource-modal.pc";
import { TextInput } from "../../TextInput";
import { useDispatch, useSelector } from "@paperclip-ui/common";
import {
  getAllComponents,
  getScreenshotUrls,
  isResourceModalVisible,
} from "@paperclip-ui/designer/src/state";
import { designerEvents } from "@paperclip-ui/designer/src/events";
import { useDrag } from "react-dnd";

export const ResourceModal = () => {
  const {
    visible,
    allComponents,
    onBackgroundClick,
    onFilterChange,
    screenshotUrls,
    filter,
    onDragExit,
    ref,
  } = useResourceModal();
  if (!visible) {
    return null;
  }
  return (
    <styles.Container
      modalRef={ref}
      onDragExit={onDragExit}
      onBackgroundClick={onBackgroundClick}
      header={
        <TextInput
          autoFocus
          placeholder="Search..."
          onChange={onFilterChange}
        />
      }
      tabs={<></>}
      items={
        <>
          {allComponents
            .filter((info) => {
              if (!filter) {
                return true;
              }
              return (
                info.sourcePath.toLowerCase().includes(filter) ||
                info.component.name.toLowerCase().includes(filter)
              );
            })
            .map((info) => {
              return (
                <Item
                  componentId={info.component.id}
                  label={info.component.name}
                  screenshotUrl={screenshotUrls[info.component.id]}
                />
              );
            })}
        </>
      }
    />
  );
};

const useResourceModal = () => {
  const ref = useRef<HTMLDivElement>();
  const visible = useSelector(isResourceModalVisible);
  const allComponents = useSelector(getAllComponents);
  const screenshotUrls = useSelector(getScreenshotUrls);
  const [filter, setFilter] = useState("");
  const dispatch = useDispatch();
  const onDragExit = (event: React.DragEvent<any>) => {
    console.log(event.target, event.currentTarget, ref.current);
    if (event.target === ref.current) {
      dispatch(designerEvents.resourceModalDragLeft());
    }
  };
  const onBackgroundClick = () =>
    dispatch(designerEvents.resourceModalBackgroundClicked());
  const onFilterChange = (value: string) => setFilter(value?.toLowerCase());
  return {
    visible,
    filter,
    ref,
    onDragExit,
    allComponents,
    onBackgroundClick,
    onFilterChange,
    screenshotUrls,
  };
};

export type ItemProps = {
  componentId: string;
  label: string;
  screenshotUrl?: string;
};

const Item = ({ componentId, label, screenshotUrl }: ItemProps) => {
  const { style, ref } = useItem({ componentId });
  return (
    <styles.Item
      ref={ref}
      label={label}
      style={style}
      previewStyle={{
        backgroundImage: `url(${screenshotUrl})`,
      }}
    />
  );
};

type UseItemProps = {
  componentId: string;
};

const useItem = ({ componentId }: UseItemProps) => {
  const [style, dragRef] = useDrag(() => ({
    type: "component",
    item: componentId,
    collect: (monitor) => ({
      opacity: monitor.isDragging() ? 0.5 : 1,
      cursor: monitor.isDragging() ? "copy" : "initial",
    }),
  }));

  return {
    style,
    ref: dragRef,
  };
};
