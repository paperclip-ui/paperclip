import React from "react";
import { History } from "./history";

export const HistoryContext = React.createContext<History>(null);

export const useHistory = (): History => {
  return React.useContext(HistoryContext);
};
