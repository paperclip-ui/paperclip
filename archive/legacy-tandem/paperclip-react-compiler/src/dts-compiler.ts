import * as path from "path";
import {
  PCModule,
  PCVisibleNode,
  PCSourceTagNames,
  DependencyGraph,
  PCDependency,
  getComponentSlots,
  isComponent,
  PCComponent,
  PCNode,
  getPCImportedChildrenSourceUris,
  getPCNodeDependency,
  extendsComponent,
  getPCNode,
  isComponentOrInstance,
  isPCComponentInstance,
  getPCVariants,
} from "@paperclip-lang/core";
import {
  TranslateContext,
  addScopedLayerLabel,
  addLine,
  getPublicComponentClassName,
  addOpenTag,
  addCloseTag,
  setCurrentScope,
  addLineItem,
  getPublicLayerVarName,
  makeSafeVarName,
} from "./utils";
import { EMPTY_ARRAY, filterNestedNodes, stripProtocol } from "tandem-common";
import { camelCase, uniq } from "lodash";
import { PCSlot } from "@paperclip-lang/core";
import {
  PCComponentInstanceElement,
  getPCParentComponentInstances,
  getInstanceExtends,
} from "@paperclip-lang/core";

export const translatePaperclipModuleToReactTSDefinition = (
  entry: PCDependency,
  graph: DependencyGraph
) => {
  return translateModule(entry.content, {
    options: {},
    entry,
    buffer: "",
    graph,
    definedObjects: {},
    scopedLabelRefs: {},
    depth: 0,
    warnings: [],
  }).buffer;
};

const translateModule = (module: PCModule, context: TranslateContext) => {
  context = addLine(`import * as React from "react";`, context);
  const components = module.children.filter(isComponent);

  for (const component of components) {
    context = setCurrentScope(module.id, context);
    context = addScopedLayerLabel(component.label, component.id, context);
    if (component.controllers) {
      for (const controllerPath of component.controllers) {
        if (isTSFilePath(controllerPath)) {
          const controllerClassName = getComponentControllerClassName(
            component,
            controllerPath,
            context
          );
          context = addLine(
            `import ${controllerClassName}, {Props as ${controllerClassName}Props} from "${controllerPath.replace(
              /\.tsx?$/,
              ""
            )}";`,
            context
          );
        }
      }
    }
  }

  const imported = {};

  for (const child of getLabeledNestedChildren(module)) {
    if (isComponent(child) || isPCComponentInstance(child)) {
      let current = child;
      while (1) {
        const dep = getPCNodeDependency(current.id, context.graph);
        if (dep.uri !== context.entry.uri) {
          if (!imported[dep.uri]) {
            imported[dep.uri] = {};
          }
          imported[dep.uri][current.id] = 1;
        }
        if (!extendsComponent(current)) {
          break;
        }
        current = getPCNode(current.is, context.graph) as PCComponent;
      }
    }
  }

  for (const uri in imported) {
    const dep = context.graph[uri];
    let relPath = path
      .relative(
        path.dirname(stripProtocol(context.entry.uri)),
        stripProtocol(dep.uri)
      )
      .replace(/\\/g, "/");
    if (relPath.charAt(0) !== ".") {
      relPath = "./" + relPath;
    }
    context = addLine(
      `import {${Object.keys(imported[uri])
        .map((id) => `_${id}Props`)
        .join(", ")}} from "${relPath}";`,
      context
    );
  }

  context = addOpenTag(`\ntype TextProps = {\n`, context);
  context = addLine(`text?: string;`, context);
  context = addCloseTag(`} & React.HTMLAttributes<any>;\n\n`, context);

  context = addOpenTag(`type ElementProps = {\n`, context);
  context = addLine(`ref?: any;`, context);
  context = addCloseTag(`} & React.HTMLAttributes<any>;\n\n`, context);

  context = setCurrentScope(module.id, context);

  for (const component of components) {
    context = translateComponent(component, context);
  }
  return context;
};

const translateComponent = (
  component: PCComponent,
  context: TranslateContext
) => {
  const componentClassName = getPublicComponentClassName(component, context);
  const componentPropsName = getComponentPropsName(component, context);

  const controllerPath = (component.controllers || EMPTY_ARRAY).find(
    isTSFilePath
  );
  const labeledNestedChildren = getLabeledNestedChildren(component) as (
    | PCVisibleNode
    | PCSlot
  )[];

  // const labeledNestedChildren =
  context = addOpenTag(
    `export type Base${getComponentPropsName(component, context)} = {\n`,
    context
  );

  context = setCurrentScope(component.id, context);

  const variantNames = getPCVariants(component)
    .map(
      (variant) => variant.label && makeSafeVarName(camelCase(variant.label))
    )
    .filter(Boolean);
  const slotNames = uniq(
    getComponentSlots(component)
      .map((slot) => slot.label && makeSafeVarName(camelCase(slot.label)))
      .filter(Boolean)
  );

  if (variantNames.length) {
    context = addLine(`variant?: string;`, context);
  }

  for (const slotName of slotNames) {
    context = addLine(`${slotName}?: any;`, context);
  }

  for (const child of labeledNestedChildren) {
    if (child.id === component.id) continue;
    if (child.name === PCSourceTagNames.SLOT) continue;
    context = addScopedLayerLabel(`${child.label} Props`, child.id, context);

    const childIsComponentInstance = isPCComponentInstance(child);

    const hasController =
      childIsComponentInstance &&
      Boolean(
        getInstanceExtends(
          child as PCComponentInstanceElement,
          context.graph
        ).find((component) =>
          Boolean(component.controllers && component.controllers.length)
        )
      );

    // if a controller is attached, then require the parameter.
    context = addLineItem(
      `${getPublicLayerVarName(`${child.label} Props`, child.id, context)}${
        hasController ? "" : "?"
      }: `,
      context
    );
    if (childIsComponentInstance) {
      context = addLineItem(
        `_${(child as PCComponentInstanceElement).is}Props`,
        context
      );
    } else {
      if (child.name === PCSourceTagNames.TEXT) {
        context = addLineItem(`TextProps`, context);
      } else {
        context = addLineItem(`ElementProps`, context);
      }
    }
    context = addLineItem(`;\n`, context);
  }

  context = setCurrentScope(context.entry.content.id, context);
  context = addCloseTag(`}`, context);

  let current = component;
  while (extendsComponent(current)) {
    const parent = getPCNode(current.is, context.graph) as PCComponent;
    context = addLineItem(` & _${parent.id}Props`, context);
    current = parent;
  }

  if (!extendsComponent(component)) {
    context = addLineItem(` & ElementProps`, context);
  }

  context = addLine(`;\n`, context);

  if (controllerPath) {
    const controllerClassName = getComponentControllerClassName(
      component,
      controllerPath,
      context
    );
    context = addLine(
      `export type _${component.id}Props = ${controllerClassName}Props;`,
      context
    );
    context = addLine(
      `export const ${componentClassName}: (props: ${controllerClassName}Props) => React.ReactElement<${controllerClassName}Props>;\n`,
      context
    );
    return context;
  }

  context = addLine(
    `export type _${component.id}Props = Base${componentPropsName};\n`,
    context
  );
  context = addLine(
    `export const ${componentClassName}: (props: Base${componentPropsName}) => React.ReactElement<Base${componentPropsName}>;\n`,
    context
  );
  return context;
};

const getLabeledNestedChildren = (parent: PCNode) => {
  return filterNestedNodes(parent, (child) => (child as any).label);
};

const getComponentPropsName = (
  component: PCComponent,
  context: TranslateContext
) => {
  return `${getPublicComponentClassName(component, context)}Props`;
};

const isTSFilePath = (filePath: string) => /tsx?$/.test(filePath);

const getComponentControllerClassName = (
  component: PCComponent,
  controller: string,
  context: TranslateContext
) => {
  const componentClassName = getPublicComponentClassName(component, context);
  return `${componentClassName}Controller${component.controllers.indexOf(
    controller
  )}`;
};
