import React, { useMemo } from "react";
import * as sidebarStyles from "@paperclip-ui/designer/src/components/Sidebar/sidebar.pc";
import * as inputStyles from "@paperclip-ui/designer/src/ui/input.pc";
import { useDispatch, useSelector } from "@paperclip-ui/common";
import {
  getAllPublicStyleMixins,
  getCurrentStyleMixins,
  getSelectedExpressionInfo,
} from "@paperclip-ui/designer/src/state";
import { Element } from "@paperclip-ui/proto/lib/generated/ast/pc";
import { DesignerEvent } from "@paperclip-ui/designer/src/events";
import {
  MultiSelectInput,
  MultiSelectOption,
} from "@paperclip-ui/designer/src/components/MultiSelectInput";

export const Mixins = () => {
  const expr = useSelector(getSelectedExpressionInfo);

  if (!expr) {
    return null;
  }

  return <MixinsInner expr={expr.expr} />;
};

type InstanceVariantsInnerProps = {
  expr: Element;
};

export const MixinsInner = ({ expr }: InstanceVariantsInnerProps) => {
  const currentStyleMixins = useSelector(getCurrentStyleMixins);

  const allMixins = useSelector(getAllPublicStyleMixins);
  const dispatch = useDispatch<DesignerEvent>();

  const onMixinsChange = (values: string[]) => {
    dispatch({ type: "designer/styleMixinsSet", payload: values });
  };

  const options = useMemo(() => {
    return allMixins.map((mixin) => {
      return (
        <MultiSelectOption
          key={mixin.style.id}
          value={mixin.style.id}
          label={<>{mixin.style.name}</>}
        />
      );
    });
  }, [allMixins]);

  return (
    <sidebarStyles.SidebarSection>
      <sidebarStyles.SidebarPanelContent>
        <inputStyles.Fields>
          <inputStyles.Field
            name="Mixins"
            input={
              <MultiSelectInput
                placeholder="mixins..."
                onChange={onMixinsChange}
                values={currentStyleMixins.map((mixin) => mixin.mixinId)}
              >
                {options}
              </MultiSelectInput>
            }
          />
        </inputStyles.Fields>
      </sidebarStyles.SidebarPanelContent>
    </sidebarStyles.SidebarSection>
  );
};
