const { generateUID } = require("tandem-common");
const { merge, values } = require("lodash");

module.exports = (module) => {
  const mapModule = ({ id, attributes, children }) => ({
    id: id,
    name: "module",
    imports: attributes && values(attributes.xmlns || {}) || [],
    version: "0.0.2",
    children: children.map(mapModuleChild)
  });

  const mapModuleChild = (child) => {
    return {
      id: generateUID(),
      name: "frame",
      bounds: child.attributes.editor && child.attributes.editor.bounds,
      children: [mapFrameChild(child)]
    };
  }

  const mapFrameChild = (child) => {
    switch(child.name) {
      case "component": return mapComponent(child);
      default: mapVisibleNode(child);
    }
  };

  const mapComponent = ({ id, attributes, children }) => ({
    id,
    name: "component",
    is: "div",
    style: {},
    attributes: {},
    label: attributes.core.label,
    container: attributes.core.container,
    children: children[0].children.map(mapVisibleNode)
  });

  const getComponentInstanceId = (componentName) => {
    const component = module.children.find(component => component.attributes.core.name === componentName);
    return component && component.id;
  }

  const mapVisibleNode = (node) => {
    switch(node.name) {
      case "element": return mapElement(node);
      case "text": return mapText(node);
      default: return mapComponentInstance(node);
    }
  };

  const mapElement = ({ id, name, attributes, children }) => ({
    id,
    name: "element",
    label: attributes.core.label,
    style: attributes.core.style || {},
    slot: attributes.core.slot,
    container: attributes.core.container,
    attributes: {},
    is: attributes.core.nativeType && attributes.core.nativeType !== "element" ? attributes.core.nativeType : "div",
    children: children.map(mapVisibleNode)
  });

  const mapText = ({ id, name, attributes }) => ({
    id,
    name: "text",
    label: attributes.core.label,
    value: attributes.core.value,
    style: attributes.core.style || {},
    children: []
  });

  const mapComponentInstance = ({ id, name, attributes, children }) => ({
    id,
    name: "component-instance",
    is: getComponentInstanceId(name) || name,
    variant: [],
    style: attributes.core.style,
    container: attributes.core.container,
    children: children.map(mapVisibleNode)
  });

  return mapModule(module);
}