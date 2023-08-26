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

  class HSLColorBox extends HTMLDivElement {
    constructor() {
      super();
      const shadow = this.attachShadow({ mode: "open" });
      this.canvas = document.createElement("canvas");
      Object.assign(this.style, {
        display: "block",
        position: "relative",
      });
      Object.assign(this.canvas.style, { width: "100%", height: "100%" });
      shadow.appendChild(this.canvas);
      this.draw();
    }
    attributeChangedCallback(name, oldValue, newValue) {
      this.draw();
    }
    draw() {
      const { width, height } = this.getBoundingClientRect();
      drawHSL(Number(this.getAttribute("hue") || 0.5))(
        this.canvas,
        width,
        height
      );
    }
  }

  class HueColorBox extends HTMLDivElement {
    constructor() {
      super();
      const shadow = this.attachShadow({ mode: "open" });
      this.canvas = document.createElement("canvas");
      Object.assign(this.style, {
        display: "block",
        position: "relative",
      });
      Object.assign(this.canvas.style, { width: "100%", height: "100%" });
      shadow.appendChild(this.canvas);
      this.draw();
    }
    draw() {
      const { width, height } = this.getBoundingClientRect();
      drawHue(this.canvas, width, height);
    }
  }
  class OpacityColorBox extends HTMLDivElement {
    constructor() {
      super();
      const shadow = this.attachShadow({ mode: "open" });
      this.canvas = document.createElement("canvas");
      Object.assign(this.style, {
        display: "block",
        position: "relative",
      });
      Object.assign(this.canvas.style, { width: "100%", height: "100%" });
      shadow.appendChild(this.canvas);
      this.draw();
    }
    draw() {
      const { width, height } = this.getBoundingClientRect();
      drawOpacity(this.canvas, width, height);
    }
  }

  try {
    customElements.define("hsl-color-box", HSLColorBox, { extends: "div" });
    customElements.define("hue-color-box", HueColorBox, { extends: "div" });
    customElements.define("alpha-color-box", OpacityColorBox, {
      extends: "div",
    });
  } catch (e) {
    console.warn(e);
  }
})();
