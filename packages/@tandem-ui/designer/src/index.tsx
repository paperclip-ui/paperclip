import ReactDOM from "react-dom";
import React from "react";
import { RootComponent } from "./components/root";
import { configureStore } from "@reduxjs/toolkit";
import { rootReducer } from "./reducers";
import { Provider as ReduxProvider } from "react-redux";
import { INITIAL_STATE, ProjectInfo } from "./state";
import { FrontEndEngineOptions, reduxMiddleware } from "./engines";

export type InitOptions = {
  document: Document;
  engineOptions: FrontEndEngineOptions;
};

// export { FrontEndEngineOptions, ProjectInfo };

export const init = ({ document, engineOptions }: InitOptions) => {
  console.log(document);

  const element = document.createElement("div");

  // global state management
  const store = configureStore({
    reducer: rootReducer,
    preloadedState: INITIAL_STATE as any,

    // engines
    middleware: (getDefaultMiddleware) =>
      // dissable serialize check because of content Buffer
      getDefaultMiddleware({ serializableCheck: false }).concat(
        reduxMiddleware(engineOptions) as any
      ),
  });

  ReactDOM.render(
    <ReduxProvider store={store}>
      <RootComponent />
    </ReduxProvider>,
    element
  );

  return { element };
};
