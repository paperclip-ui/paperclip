import { createMockEngineOptions } from "./engines/adaptes/mock";
import { init } from "./index";

const { element } = init({
  document,
  engineOptions: createMockEngineOptions({
    files: {
      "file:///hello.pc": JSON.stringify({
        id: "ee973a824",
        name: "module",
        version: "0.0.6",
        children: [
          {
            label: "Application",
            is: "div",
            style: {},
            attributes: {},
            id: "ee973a823",
            name: "component",
            children: [
              {
                id: "ee973a822",
                name: "text",
                label: "App content",
                value: "App content",
                style: {},
                children: [],
                metadata: {},
              },
            ],
            metadata: {
              bounds: {
                left: 0,
                right: 600,
                top: 0,
                bottom: 400,
              },
            },
            variant: {},
          },
        ],
        metadata: {},
      }),
    },
    projectInfo: {
      config: {
        exclude: [],
      },
      path: "/",
    },
  }),
});

const mount = document.createElement("div");
mount.appendChild(element);
document.querySelector(".loader-container").remove();

document.body.appendChild(mount);
