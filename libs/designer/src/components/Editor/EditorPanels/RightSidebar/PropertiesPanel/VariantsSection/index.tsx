import React, { useState } from "react";
import * as inputStyles from "@paperclip-ui/designer/src/styles/input.pc";
import { useSelector } from "@paperclip-ui/common";
import { getSelectedExpression } from "@paperclip-ui/designer/src/machine/state/pc";
import { ast } from "@paperclip-ui/proto-ext/lib/ast/pc-utils";
import { EditVariantPopup, SaveOptions } from "./EditVariantPopup";

export const VariantsSection = () => {
  const {
    variants,
    editVariantPopupOpen,
    onAddClick,
    onCloseEditVariantPopup,
    onSaveCurrentVariant,
  } = useVariantsSection();

  const inputs = [
    ...variants.map((variant) => {
      return (
        <inputStyles.ListItemInput key={variant.id} class="removable">
          {variant.name}
        </inputStyles.ListItemInput>
      );
    }),
    <inputStyles.AddListItemButton key="add-button" onClick={onAddClick} />,
  ];

  return (
    <>
      {editVariantPopupOpen && (
        <EditVariantPopup
          onSave={onSaveCurrentVariant}
          onClose={onCloseEditVariantPopup}
        />
      )}
      <inputStyles.Field name="Variants" input={inputs[0]} />
      {...inputs
        .slice(1)
        .map((input) => (
          <inputStyles.Field key={input.props.key} input={input} />
        ))}
    </>
  );
};

const useVariantsSection = () => {
  const component = useSelector(getSelectedExpression);
  const variants = ast.getComponentVariants(component);
  const [editVariantPopupOpen, setVariantPopupOpen] = useState(false);

  const onAddClick = () => {
    setVariantPopupOpen(true);
  };

  const onCloseEditVariantPopup = () => {
    setVariantPopupOpen(false);
  };
  const onSaveCurrentVariant = ({ name }: SaveOptions) => {};

  return {
    component,
    onSaveCurrentVariant,
    onCloseEditVariantPopup,
    editVariantPopupOpen,
    variants,
    onAddClick,
  };
};
