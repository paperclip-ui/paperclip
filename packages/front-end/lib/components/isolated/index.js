import React from "react";
import ReactDOM from "react-dom";
import { bubbleHTMLIframeEvents } from "tandem-common";
import { Consumer } from "react-dnd/lib/DragDropContext";
export class Isolate extends React.Component {
    constructor() {
        super(...arguments);
        this.onLoad = () => {
            if (this.props.onLoad)
                this.props.onLoad();
        };
        this.onWheel = event => {
            this.props.onWheel(event);
        };
        this.onScroll = event => {
            if (this.props.onScroll)
                this.props.onScroll(event);
            if (this.props.scrolling === false) {
                const db = this._iframe.contentDocument;
                db.body.scrollLeft = db.body.scrollTop = 0;
            }
        };
        this.setIframe = (iframe) => {
            this._iframe = iframe;
        };
        this.onTouchMove = () => { };
    }
    componentDidMount() {
        if (window["$synthetic"]) {
            return;
        }
        this._dragDropManager.getBackend().addEventListeners(this.window);
        if (this.props.inheritCSS) {
            const head = this.head;
            const tags = [
                ...Array.prototype.slice.call(document.getElementsByTagName("style"), 0),
                ...Array.prototype.slice.call(document.getElementsByTagName("link"), 0)
            ];
            Array.prototype.forEach.call(tags, function (style) {
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
        const scrollPosition = this.props.scrollPosition;
        if (this.window && scrollPosition) {
            if (scrollPosition.left !== this.window.scrollX ||
                scrollPosition.top !== this.window.scrollY) {
                this.window.scrollTo(scrollPosition.left, scrollPosition.top);
            }
        }
    }
    get window() {
        return this._iframe && this._iframe.contentWindow;
    }
    get head() {
        return this.window.document.head;
    }
    get body() {
        return this.window.document.body;
    }
    _render() {
        if (window["$synthetic"])
            return;
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
    receiveDragDropManager(manager) {
        if (this._dragDropManager) {
            return;
        }
        this._dragDropManager = manager;
    }
    render() {
        // TODO - eventually want to use iframes. Currently not supported though.
        if (window["$synthetic"]) {
            return React.createElement("span", null, this.props.children);
        }
        return (React.createElement(Consumer, null, ({ dragDropManager }) => {
            this.receiveDragDropManager(dragDropManager);
            return (React.createElement("iframe", { ref: this.setIframe, onDragOver: this.props.onDragOver, onDrop: this.props.onDrop, onWheel: this.onWheel, onScroll: this.onScroll, onTouchMove: this.onTouchMove, onLoad: this.onLoad, className: this.props.className, style: this.props.style }));
        }));
    }
}
//# sourceMappingURL=index.js.map