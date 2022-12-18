import React, { useEffect, useRef, useState } from "react";
import * as styles from "@paperclip-ui/designer/src/styles/resource-modal.pc";
import { TextInput } from "../../TextInput";
import { useDispatch, useSelector } from "@paperclip-ui/common";
import {
  DNDKind,
  getAllComponents,
  getScreenshotUrls,
  isResourceModalVisible,
} from "@paperclip-ui/designer/src/state";
import { boxIntersectsPoint } from "@paperclip-ui/designer/src/state/geom";
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
    ref,
  } = useResourceModal();
  if (!visible) {
    return null;
  }
  return (
    <styles.Container
      modalRef={ref}
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

  // onDragLeave not working so we brute force it like so
  useEffect(() => {
    const onMouseMove = (event: DragEvent) => {
      if (
        ref.current &&
        !boxIntersectsPoint(ref.current.getBoundingClientRect(), {
          x: event.pageX,
          y: event.pageY,
        })
      ) {
        dispatch(designerEvents.resourceModalDragLeft());
      }
    };

    document.body.addEventListener("dragover", onMouseMove);

    return () => {
      document.body.removeEventListener("dragover", onMouseMove);
    };
  });
  const onBackgroundClick = () =>
    dispatch(designerEvents.resourceModalBackgroundClicked());
  const onFilterChange = (value: string) => setFilter(value?.toLowerCase());
  return {
    visible,
    filter,
    ref,
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
    type: DNDKind.Resource,
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
