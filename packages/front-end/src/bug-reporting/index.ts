import * as React from "react";
import * as ReactDOM from "react-dom";
import { Main } from "./components/main/view.pc";

export const init = (dispatch: Function) => {
  let triggered = false;

  const triggerError = error => {
    console.error(error);
    if (triggered) {
      return;
    }

    triggered = true;

    const div = document.createElement("div");
    document.body.appendChild(div);
    ReactDOM.render(React.createElement(Main, { dispatch }), div);
  };
  return {
    triggerError
  };
};
