import { PCQuery, PCQueryType } from "paperclip";

import { DropdownMenuOption } from "../../../../inputs/dropdown/controller";
export const QUERY_DROPDOWN_OPTIONS: DropdownMenuOption[] = [
  {
    label: "Screen size",
    value: PCQueryType.MEDIA
  },
  {
    label: "Variable change",
    value: PCQueryType.VARIABLE
  }
];
