import styleValueController from "./style-value-controller";
import { Props as DropdownProps } from "../../../../../../../inputs/dropdown/controller";

export type Props = DropdownProps;

export default (Base: React.ComponentClass<DropdownProps>) =>
  styleValueController(Base);
