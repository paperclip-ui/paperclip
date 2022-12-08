import React, { useMemo } from "react";
import * as inputStyles from "@paperclip-ui/designer/src/styles/input.pc";
import * as sidebarStyles from "@paperclip-ui/designer/src/styles/sidebar.pc";
import {
  MultiSelectInput,
  MultiSelectOption,
} from "@paperclip-ui/designer/src/components/MultiSelectInput";
import { useDispatch, useSelector } from "@paperclip-ui/common";
import { getSelectedExprAvailableVariants } from "@paperclip-ui/designer/src/state/pc";
import { designerEvents } from "@paperclip-ui/designer/src/events";
import { ast } from "@paperclip-ui/proto-ext/lib/ast/pc-utils";

export const Variants = () => {
  const { variants, activeVariantIds, onChange } = useVariantSection();

  const options = useMemo(() => {
    return variants?.map((variant) => {
      return <MultiSelectOption label={variant.name} value={variant.id} />;
    });
  }, [variants]);

  if (!variants) {
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
  const dispatch = useDispatch();
  const variants = useSelector(getSelectedExprAvailableVariants);
  const activeVariantIds =
    variants?.filter(ast.isVariantEnabled).map((variant) => variant.id) || [];
  const onChange = (values) => {
    dispatch(designerEvents.variantsSelected(values));
  };
  return { variants, onChange, activeVariantIds };
};
