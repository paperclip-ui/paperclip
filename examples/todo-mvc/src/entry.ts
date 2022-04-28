import * as React from "react";
import * as ReactDOM from "react-dom";
import { Main } from "./main.pc";

const mount = document.createElement("div");

document.body.appendChild(mount);

ReactDOM.render(React.createElement(Main), mount);
