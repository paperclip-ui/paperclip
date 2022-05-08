import React from "react";
import ReactDOM from "react-dom";
import { bubbleHTMLIframeEvents, Point } from "tandem-common";
import { Consumer } from "react-dnd/lib/DragDropContext";

export class Isolate extends React.Component<
  {
    inheritCSS?: boolean;
    onMouseDown?: any;
    onKeyDown?: any;
    onLoad?: any;
    scrollPosition?: Point;
    children: any;
    ignoreInputEvents?: boolean;
    translateMousePositions?: boolean;
    onScroll?: any;
    scrolling?: boolean;
    style?: any;
    onWheel?: any;
    onDragOver?: any;
    className?: string;
    onDrop?: any;
  },
  any
> {
  private _mountElement: any;
  private _iframe: HTMLIFrameElement;
  private _dragDropManager: any;

  componentDidMount() {
    if (window["$synthetic"]) {
      return;
    }

    this._dragDropManager.getBackend().addEventListeners(this.window);

    if (this.props.inheritCSS) {
      const head = this.head;

      const tags = [
        ...Array.prototype.slice.call(
          document.getElementsByTagName("style"),
          0
        ),
        ...Array.prototype.slice.call(document.getElementsByTagName("link"), 0)
      ];

      Array.prototype.forEach.call(tags, function(style) {
        head.appendChild(style.cloneNode(true));
      });
    }

    this.body.appendChild((this._mountElement = document.createElement("div")));

    if (this.props.onMouseDown) {
      this.body.addEventListener("mousedown", this.props.onMouseDown);
    }

    if (this.props.onKeyDown) {
      this.body.addEventListener("keydown", this.props.onKeyDown);
    }

    this._render();

    this._addListeners();
  }

  componentWillUnmount() {
    if (this._dragDropManager) {
      this._dragDropManager.getBackend().removeEventListeners(this.window);
    }
  }

  componentDidUpdate() {
    this._render();
    const scrollPosition = this.props.scrollPosition as Point;

    if (this.window && scrollPosition) {
      if (
        scrollPosition.left !== this.window.scrollX ||
        scrollPosition.top !== this.window.scrollY
      ) {
        this.window.scrollTo(scrollPosition.left, scrollPosition.top);
      }
    }
  }

  get window(): Window {
    return this._iframe && this._iframe.contentWindow;
  }

  get head() {
    return this.window.document.head;
  }

  get body() {
    return this.window.document.body;
  }

  onLoad = () => {
    if (this.props.onLoad) this.props.onLoad();
  };

  _render() {
    if (window["$synthetic"]) return;
    if (this.props.children && this._mountElement) {
      ReactDOM.render(this.props.children, this._mountElement);
    }
  }

  _addListeners() {
    bubbleHTMLIframeEvents(this._iframe, {
      ignoreInputEvents: this.props.ignoreInputEvents,
      translateMousePositions: this.props.translateMousePositions
    });
  }

  onWheel = event => {
    this.props.onWheel(event);
  };

  onScroll = event => {
    if (this.props.onScroll) this.props.onScroll(event);
    if (this.props.scrolling === false) {
      const db = this._iframe.contentDocument;
      db.body.scrollLeft = db.body.scrollTop = 0;
    }
  };

  setIframe = (iframe: HTMLIFrameElement) => {
    this._iframe = iframe;
  };
  receiveDragDropManager(manager: any) {
    if (this._dragDropManager) {
      return;
    }
    this._dragDropManager = manager;
  }

  onTouchMove = () => {};

  render() {
    // TODO - eventually want to use iframes. Currently not supported though.
    if (window["$synthetic"]) {
      return <span>{this.props.children}</span>;
    }

    return (
      <Consumer>
        {({ dragDropManager }) => {
          this.receiveDragDropManager(dragDropManager);
          return (
            <iframe
              ref={this.setIframe}
              onDragOver={this.props.onDragOver}
              onDrop={this.props.onDrop}
              onWheel={this.onWheel}
              onScroll={this.onScroll}
              onTouchMove={this.onTouchMove}
              onLoad={this.onLoad}
              className={this.props.className}
              style={this.props.style}
            />
          );
        }}
      </Consumer>
    );
  }
}
