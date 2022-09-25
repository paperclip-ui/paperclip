import React from "react";
import ReactDOM from "react-dom/client";
import { Main } from "./components/Main";
import { createEditorMachine } from "./machine";

ReactDOM.createRoot(document.querySelector("#app")).render(<Main />);
