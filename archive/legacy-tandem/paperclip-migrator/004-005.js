module.exports = (module) => {
  const mapModule = (module) => {
    return {
      id: module.id,
      version: "0.0.5",
      metadata: {},
      name: "module",
      children: module.children.map(mapNode),
    };
  };

  const mapNode = (node) => {
    if (node.name === "component-instance" || node.name === "component") {
      return Object.assign({}, node, {
        variant: node.variant || {},
      });
    }

    return node;
  };

  return mapModule(module);
};
