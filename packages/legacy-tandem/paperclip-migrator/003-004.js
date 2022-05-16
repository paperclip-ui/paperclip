module.exports = (module) => {
  const mapModule = (module) => {
    return {
      id: module.id,
      version: "0.0.4",
      metadata: {},
      name: "module",
      children: module.children.map(mapNode).filter(Boolean),
    };
  };

  const mapNode = (node) => {
    if (node.name === "override" && node.propertyName === "label") {
      return null;
    }

    return Object.assign({}, node, {
      children: node.children.map(mapNode).filter(Boolean),
    });
  };

  return mapModule(module);
};
