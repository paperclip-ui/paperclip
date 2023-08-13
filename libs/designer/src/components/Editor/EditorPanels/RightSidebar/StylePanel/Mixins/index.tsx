import React, { useMemo } from "react";
import * as sidebarStyles from "@paperclip-ui/designer/src/styles/sidebar.pc";
import * as inputStyles from "@paperclip-ui/designer/src/styles/input.pc";
import { useDispatch, useSelector } from "@paperclip-ui/common";
import {
  getAllPublicStyleMixins,
  getGraph,
  getSelectedExpressionInfo,
  getSelectedExprOwnerComponent,
  getSelectedVariantIds,
} from "@paperclip-ui/designer/src/state";
import { ast } from "@paperclip-ui/proto-ext/lib/ast/pc-utils";
import { Element } from "@paperclip-ui/proto/lib/generated/ast/pc";
import { DesignerEvent } from "@paperclip-ui/designer/src/events";
import classNames from "classnames";
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
  const graph = useSelector(getGraph);
  const selectedVariantIds = useSelector(getSelectedVariantIds);
  const mixins = useSelector(getAllPublicStyleMixins);
  const component = ast.getInstanceComponent(expr, graph);
  const variants = component?.body.filter((body) => body.variant != null);
  const dispatch = useDispatch<DesignerEvent>();

  const onVariantToggle = (variantId: string) => {
    dispatch({ type: "designer/instanceVariantToggled", payload: variantId });
  };

  const onMixinsChange = (values) => {
    console.log(values);
  };

  if (!component || variants.length === 0) {
    return null;
  }

  const options = useMemo(() => {
    return mixins.map((mixin) => {
      return (
        <MultiSelectOption
          key={mixin.style.id}
          value={mixin.style.id}
          label={<>{mixin.style.name}</>}
        />
      );
    });
  }, [mixins]);

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
                values={[]}
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
