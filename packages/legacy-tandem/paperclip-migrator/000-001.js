const { merge } = require("lodash");

module.exports = (module) => {
  return merge({}, module, {
    id: module.id || Math.round(Math.random() * 9999999999) + "." + Date.now(),
    version: "0.0.1",
    children: (module.children && module.children.map(mapModuleChild)) || [],
  });
};

const mapModuleChild = (child) => {
  if (child.name === "component") {
    return mapComponent(child);
  }
  return child;
};

const mapComponent = (component) =>
  merge({}, component, {
    attributes: {
      core: {
        name: component.attributes.core.id,
        id: null,
      },
    },
  });
