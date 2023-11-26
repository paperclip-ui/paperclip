import React, { useEffect, useRef, useState } from "react";
import * as styles from "@paperclip-ui/designer/src/ui/resource-modal.pc";
import * as etcStyles from "@paperclip-ui/designer/src/ui/etc.pc";
import { TextInput } from "../../TextInput";
import { useDispatch, useSelector } from "@paperclip-ui/common";
import {
  DNDKind,
  getAllComponents,
  getScreenshotUrls,
  isResourceModalVisible,
} from "@paperclip-ui/designer/src/state";
import { boxIntersectsPoint } from "@paperclip-ui/designer/src/state/geom";
import { DesignerEvent } from "@paperclip-ui/designer/src/events";
import { useDrag } from "react-dnd";
import { Component } from "@paperclip-ui/proto/lib/generated/ast/pc";

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
                  component={info.component}
                  screenshotUrl={screenshotUrls[info.component.id]}
                  key={info.component.id}
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
  const dispatch = useDispatch<DesignerEvent>();

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
        dispatch({ type: "ui/resourceModalDragLeft" });
      }
    };

    document.body.addEventListener("dragover", onMouseMove);

    return () => {
      document.body.removeEventListener("dragover", onMouseMove);
    };
  });
  const onBackgroundClick = () =>
    dispatch({ type: "ui/resourceModalBackgroundClicked" });
  const onFilterChange = (value: string) => setFilter(value?.toLowerCase());

  useEffect(() => {
    if (!visible) {
      setFilter("");
    }
  }, [visible]);
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
  component: Component;
  screenshotUrl?: string;
};

const Item = ({ component, screenshotUrl }: ItemProps) => {
  const { style, ref } = useItem({ component });
  return (
    <etcStyles.Item
      ref={ref}
      rootProps={{ style }}
      previewProps={{
        style: {
          backgroundImage: `url(${screenshotUrl})`,
        }
      }}
      label={component.name}
    />
  );
};

type UseItemProps = {
  component: Component;
};

const useItem = ({ component }: UseItemProps) => {
  const [style, dragRef] = useDrag(() => ({
    type: DNDKind.Resource,
    item: component,
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
