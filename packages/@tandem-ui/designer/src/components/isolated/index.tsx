import React, { useCallback, useEffect, useState, forwardRef } from "react";
import ReactDOM from "react-dom";
import { bubbleHTMLIframeEvents, Point } from "tandem-common";
import { Provider as ReduxProvider, useStore } from "react-redux";
import { Consumer } from "react-dnd/lib/DragDropContext";

export type IsolateProps = {
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
};

export const Isolate = ({
  className,
  children,
  onLoad: onLoad2,
  onWheel,
  scrollPosition,
  scrolling,
  onScroll: onScroll2,
  ignoreInputEvents,
  inheritCSS,
  translateMousePositions,
  onKeyDown,
  onMouseDown,
  onDragOver,
  onDrop,
  style,
}: IsolateProps) => {
  const [dragDropManager, setDragDropManager] = useState<any>();
  const [iframe, setIframe] = useState<HTMLIFrameElement>();
  const [mountElement, setMountElement] = useState<any>();
  const [loaded, setLoaded] = useState(false);

  const store = useStore();
  const onScroll = useCallback(
    (event: any) => {
      if (onScroll2) onScroll2(event);
      if (scrolling === false && iframe?.contentDocument) {
        const db = iframe?.contentDocument;
        db.body.scrollLeft = db.body.scrollTop = 0;
      }
    },
    [scrolling, iframe?.contentDocument]
  );

  const onLoad = () => {
    setLoaded(true);
    if (onLoad2) {
      onLoad2();
    }
  };

  const onWheel2 = (event) => {
    const handleNative = onWheel(event);
    console.log(handleNative);
  };

  useEffect(() => {
    if (!dragDropManager || !iframe?.contentWindow) {
      return;
    }

    dragDropManager.getBackend().addEventListeners(iframe.contentWindow);

    if (inheritCSS) {
      const head = iframe?.contentDocument.head;

      const tags = [
        ...Array.prototype.slice.call(
          document.getElementsByTagName("style"),
          0
        ),
        ...Array.prototype.slice.call(document.getElementsByTagName("link"), 0),
      ];

      Array.prototype.forEach.call(tags, function (style) {
        head.appendChild(style.cloneNode(true));
      });
    }

    const mountElement = document.createElement("div");
    iframe.contentDocument.body.appendChild(mountElement);
    setMountElement(mountElement);

    if (onMouseDown) {
      iframe.contentDocument.body.addEventListener("mousedown", onMouseDown);
    }

    if (onKeyDown) {
      iframe.contentDocument.body.addEventListener("keydown", onKeyDown);
    }

    return () => {
      if (dragDropManager) {
        dragDropManager.getBackend().removeEventListeners(iframe.contentWindow);
      }
    };
  }, [dragDropManager, inheritCSS, loaded, iframe?.contentWindow]);

  useEffect(() => {
    if (!iframe?.contentWindow) {
      return;
    }
    bubbleHTMLIframeEvents(iframe, {
      ignoreInputEvents,
      translateMousePositions,
    });
  }, [loaded, iframe?.contentWindow]);

  useEffect(() => {
    if (!iframe?.contentWindow) {
      return;
    }

    if (iframe?.contentWindow && scrollPosition) {
      if (
        scrollPosition.left !== iframe.contentWindow.scrollX ||
        scrollPosition.top !== iframe.contentWindow.scrollY
      ) {
        iframe.contentWindow.scrollTo(scrollPosition.left, scrollPosition.top);
      }
    }
  }, [scrollPosition, loaded, iframe?.contentWindow]);

  useEffect(() => {
    if (!mountElement) {
      return;
    }

    ReactDOM.render(
      <ReduxProvider store={store}>{children}</ReduxProvider>,
      mountElement
    );
  }, [mountElement, store, children]);

  return (
    <Consumer>
      {({ dragDropManager }) => {
        return (
          <Inner
            ref={setIframe}
            dragDropManager={dragDropManager}
            setDragDropManager={setDragDropManager}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onWheel={onWheel2}
            onScroll={onScroll}
            onLoad={onLoad}
            className={className}
            style={style}
          />
        );
      }}
    </Consumer>
  );
};

const Inner = forwardRef(
  ({ setDragDropManager, dragDropManager, style = {}, ...rest }: any, ref) => {
    useEffect(() => {
      setDragDropManager(dragDropManager);
    }, [dragDropManager]);
    return <iframe ref={ref} {...rest} style={{ ...style, border: "none" }} />;
  }
);
