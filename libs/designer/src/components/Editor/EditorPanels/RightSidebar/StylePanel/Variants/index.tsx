import React, { useMemo } from "react";
import * as inputStyles from "@paperclip-ui/designer/src/styles/input.pc";
import * as sidebarStyles from "@paperclip-ui/designer/src/styles/sidebar.pc";
import {
  MultiSelectInput,
  MultiSelectOption,
} from "@paperclip-ui/designer/src/components/MultiSelectInput";
import { useDispatch, useSelector } from "@paperclip-ui/common";
import {
  getSelectedExprAvailableVariants,
  getSelectedExprOwnerComponent,
} from "@paperclip-ui/designer/src/state/pc";
import {
  DesignerEvent,
  designerEvents,
} from "@paperclip-ui/designer/src/events";
import { ast } from "@paperclip-ui/proto-ext/lib/ast/pc-utils";

export const Variants = () => {
  const { variants, activeVariantIds, onChange, visible } = useVariantSection();

  const options = useMemo(() => {
    return variants?.map((variant) => {
      return <MultiSelectOption label={variant.name} value={variant.id} />;
    });
  }, [variants]);

  if (!visible) {
    return null;
  }

  return (
    <sidebarStyles.SidebarSection>
      <sidebarStyles.SidebarPanelContent>
        <inputStyles.Field
          name="variant"
          input={
            <MultiSelectInput
              placeholder="Select..."
              onChange={onChange}
              values={activeVariantIds}
            >
              {options}
            </MultiSelectInput>
          }
        />
      </sidebarStyles.SidebarPanelContent>
    </sidebarStyles.SidebarSection>
  );
};

const useVariantSection = () => {
  const dispatch = useDispatch<DesignerEvent>();
  const variants = useSelector(getSelectedExprAvailableVariants);
  const component = useSelector(getSelectedExprOwnerComponent);
  const activeVariantIds =
    variants?.filter(ast.isVariantEnabled).map((variant) => variant.id) || [];
  const onChange = (values) => {
    dispatch({ type: "designer/variantSelected", payload: values });
  };
  return {
    variants,
    onChange,
    activeVariantIds,
    visible: Boolean(variants && component),
  };
};
