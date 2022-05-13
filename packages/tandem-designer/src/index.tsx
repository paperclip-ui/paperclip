import ReactDOM from "react-dom";
import React from "react";
import { RootComponent } from "./components/root";
import { configureStore } from "@reduxjs/toolkit";
import { rootReducer } from "./reducers";
import { Provider as ReduxProvider } from "react-redux";

export type InitOptions = {
  document: Document;
};

export const init = ({ document }: InitOptions) => {
  const element = document.createElement("div");
  const store = configureStore({
    reducer: rootReducer,
  });

  ReactDOM.render(
    <ReduxProvider store={store}>
      <RootComponent />
    </ReduxProvider>,
    element
  );

  console.log("OK");

  return { element };
};
