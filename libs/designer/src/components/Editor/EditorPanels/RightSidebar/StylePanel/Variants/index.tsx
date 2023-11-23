import React, { useMemo } from "react";
import * as inputStyles from "@paperclip-ui/designer/src/ui/input.pc";
import * as sidebarStyles from "@paperclip-ui/designer/src/components/Sidebar/sidebar.pc";
import {
  MultiSelectInput,
  MultiSelectOption,
} from "@paperclip-ui/designer/src/components/MultiSelectInput";
import { useDispatch, useSelector } from "@paperclip-ui/common";
import {
  getSelectedExprAvailableVariants,
  getSelectedExprOwnerComponent,
  getSelectedVariantIds,
} from "@paperclip-ui/designer/src/state/pc";
import { DesignerEvent } from "@paperclip-ui/designer/src/events";

export const Variants = () => {
  const { variants, selectedVariantIds, onChange, visible } =
    useVariantSection();

  const options = useMemo(() => {
    return variants?.map((variant) => {
      return <MultiSelectOption label={variant.name} value={variant.id} />;
    });
  }, [variants]);

  if (!visible || !options.length) {
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
              values={selectedVariantIds}
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
  const selectedVariantIds = useSelector(getSelectedVariantIds);

  const onChange = (values: any[]) => {
    dispatch({ type: "ui/variantSelected", payload: values });
  };
  return {
    variants,
    onChange,
    selectedVariantIds,
    visible: Boolean(variants && component),
  };
};
