import { init } from "./index";

const { element } = init({
  document,
});

const mount = document.createElement("div");
mount.appendChild(element);
