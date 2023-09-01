// from https://github.com/crcn/tandem-old/blob/10.0.0/packages/front-end/src/components/inputs/color/picker-controller.tsx
(() => {
  const drawHSL = (h) => (canvas, width, height) => {
    const hv = h * 360;
    const ctx = canvas.getContext("2d");
    canvas.width = width;
    canvas.height = height;

    for (let row = 0; row <= height; row++) {
      let grad = ctx.createLinearGradient(0, 0, width, 0);
      grad.addColorStop(
        1,
        `hsl(${hv}, 0%, ${((height - row) / height) * 100}%)`
      );
      grad.addColorStop(
        0,
        `hsl(${hv}, 100%, ${((height - row) / height) * 50}%)`
      );

      ctx.fillStyle = grad;
      ctx.fillRect(0, row, width, 1);
    }
  };

  const drawHue = (canvas, width, height) => {
    const ctx = canvas.getContext("2d");
    canvas.width = width;
    canvas.height = height;

    for (let row = 0; row <= width; row++) {
      ctx.fillStyle = `hsl(${((row - width) / width) * 360}, 100%, 50%)`;
      ctx.fillRect(row, 0, 1, height);
    }
  };

  const drawOpacity = (canvas, width, height) => {
    let ctx = canvas.getContext("2d");
    canvas.width = width;
    canvas.height = height;
    for (let row = 0; row <= width; row++) {
      const num = Math.round(((width - row) / width) * 255);
      ctx.fillStyle = `rgb(${num}, ${num}, ${num})`;
      ctx.fillRect(row, 0, 1, height);
    }
  };

  class HSLColorBox extends HTMLElement {
    constructor() {
      super();
    }
    connectedCallback() {
      const shadow = this.attachShadow({ mode: "open" });
      const canvas = document.createElement("canvas");
      Object.assign(this.style, {
        display: "block",
        position: "relative",
        width: "100%",
        height: "100%",
      });

      const { width, height } = this.getBoundingClientRect();

      shadow.appendChild(canvas);
      drawHSL(Number(this.getAttribute("hue") || 1))(canvas, width, height);
    }
    attributeChangedCallback(name, oldValue, newValue) {
      // this.draw();
    }
  }

  class HueColorBox extends HTMLElement {
    constructor() {
      super();
    }
    connectedCallback() {
      const shadow = this.attachShadow({ mode: "open" });
      const canvas = document.createElement("canvas");
      Object.assign(this.style, {
        display: "block",
        position: "relative",
        width: "100%",
        height: "100%",
      });
      const { width, height } = this.getBoundingClientRect();
      shadow.appendChild(canvas);
      drawHue(canvas, width, height);
    }
    draw() {}
  }
  class OpacityColorBox extends HTMLElement {
    constructor() {
      super();
    }
    connectedCallback() {
      const shadow = this.attachShadow({ mode: "open" });
      const canvas = document.createElement("canvas");
      Object.assign(this.style, {
        display: "block",
        position: "relative",
        width: "100%",
        height: "100%",
      });

      const { width, height } = this.getBoundingClientRect();
      shadow.appendChild(canvas);
      drawOpacity(canvas, width, height);
    }
  }

  try {
    customElements.define("x-hsl-color-box", HSLColorBox);
    customElements.define("x-hue-color-box", HueColorBox);
    customElements.define("x-alpha-color-box", OpacityColorBox);
  } catch (e) {
    console.warn(e);
  }
})();
