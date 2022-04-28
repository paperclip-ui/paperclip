import * as ReactDOM from "react-dom";
import * as React from "react";
import { Application } from "./components/main/view.pc";

const mount = document.createElement("div");
document.body.appendChild(mount);

ReactDOM.render(React.createElement(Application), mount);
