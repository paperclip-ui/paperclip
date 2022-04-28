import {
  Bounds,
  createBounds,
  moveBounds,
  zoomBounds,
  Translate,
  shiftBounds
} from "../state";

export function translateAbsoluteToRelativePoint(event, relativeElement) {
  const zoom = relativeElement;

  const left = event.clientX || event.left;
  const top = event.clientY || event.top;

  const bounds = relativeElement.getBoundingClientRect();

  const rx = left - bounds.left;
  const ry = top - bounds.top;

  return { left: rx, top: ry };
}

export function calculateCSSMeasurments(style): any {
  const calculated = {};
  for (let key in style) {
    if (hasMeasurement(key)) {
      calculated[key] = Number(style[key].replace("px", ""));
    }
  }
  return calculated;
}

/**
 * Robust method for fetching parent nodes outside
 * of an iframe
 */

function getParentNode(node: Node): HTMLElement {
  const parentNode = <Node>node.parentNode;

  // if (parentNode) {
  //   if (parentNode.nodeName === "#document") {
  //     const localWindow  = node.ownerDocument.defaultView;
  //     if (localWindow && localWindow !== window) {
  //       const parentWindow = localWindow.parent;
  //       return Array.prototype.find.call(parentWindow.document.querySelectorAll("iframe"), (iframe) => {
  //         return iframe.contentWindow === localWindow;
  //       });
  //     }

  //   // shadow root
  //   } else if (parentNode.nodeName === "#document-fragment" && parentNode["host"]) {
  //     return parentNode["host"];
  //   }
  // }

  return <HTMLElement>parentNode;
}

function parseCSSMatrixValue(value: string) {
  return value
    .replace(/matrix\((.*?)\)/, "$1")
    .split(/,\s/)
    .map(value => Number(value));
}

function calculateTransform(node: HTMLElement, includeIframes: boolean = true) {
  let cnode = <HTMLElement>node;
  let matrix = [0, 0, 0, 0, 0, 0];
  while (cnode) {
    if (cnode.nodeName === "IFRAME" && cnode !== node && !includeIframes) {
      break;
    }

    if (cnode.nodeType === 1) {
      // TODO - this needs to be memoized - getComputedStyle is expensive.
      const style = cnode.ownerDocument.defaultView.getComputedStyle(cnode);
      if (style.transform !== "none") {
        const cnodeMatrix = parseCSSMatrixValue(style.transform);
        for (let i = cnodeMatrix.length; i--; ) {
          matrix[i] += cnodeMatrix[i];
        }
      }
    }

    cnode = getParentNode(cnode);
  }

  return [
    matrix[0] || 1,
    matrix[1],
    matrix[2],
    matrix[3] || 1,
    matrix[4],
    matrix[5]
  ];
}

export function calculateUntransformedBoundingRect(node: HTMLElement) {
  const rect = node.getBoundingClientRect();
  const bounds = createBounds(rect.left, rect.right, rect.top, rect.bottom);
  const matrix = calculateTransform(node, false);
  return zoomBounds(
    shiftBounds(bounds, { left: -matrix[4], top: -matrix[5] }),
    1 / matrix[0]
  );
}

function hasMeasurement(key) {
  return /left|top|right|bottom|width|height|padding|margin|border/.test(key);
}

function roundMeasurements(style) {
  const roundedStyle = {};
  for (let key in style) {
    const measurement: string = (roundedStyle[key] = style[key]);
    if (hasMeasurement(key)) {
      const value = measurement.match(/^(-?[\d\.]+)/)[1];
      const unit = measurement.match(/([a-z]+)$/)[1];

      // ceiling is necessary here for zoomed in elements
      roundedStyle[key] = Math.round(Number(value)) + unit;
    }
  }

  return roundedStyle;
}

export const getRelativeElementPosition = (element: HTMLElement) => {
  const style = element.ownerDocument.defaultView.getComputedStyle(element);
};

export function calculateAbsoluteBounds(node: HTMLElement) {
  let rect: Bounds = calculateUntransformedBoundingRect(node);
  return rect;
}

function calculateElementTransforms(node: HTMLElement) {
  const computedStyle: any = calculateCSSMeasurments(
    node.ownerDocument.defaultView.getComputedStyle(node)
  );

  const oldWidth = node.style.width;
  const oldTop = node.style.top;
  const oldLeft = node.style.left;
  const oldBoundsSizing = node.style.boxSizing;

  node.style.left = "0px";
  node.style.top = "0px";
  node.style.width = "100px";
  node.style.boxSizing = "border-bounds";

  const bounds = this.bounds;

  const scale = bounds.width / 100;
  const left = bounds.left;
  const top = bounds.top;

  node.style.left = oldLeft;
  node.style.top = oldTop;
  node.style.width = oldWidth;
  node.style.boxSizing = oldBoundsSizing;

  return { scale, left, top };
}
