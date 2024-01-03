import { noop } from "lodash";
import { useEffect, useMemo, useRef, useState } from "react";

export type UseFrameContainerProps = {
  mount: HTMLElement;
  frameIndex?: number;
  onLoad?: () => void;
  onInjectedExtraHTML?: () => void;
  fullscreen?: boolean;
  extraHTML?: string;
};

const defaultExtraHTML = `
  <style>
  [id]:not([class]):empty {
    min-width: 100px;
    height: 100px;
    padding: 10px;
    border: 2px dashed grey;
  }
  [id]:not([class]):empty:before {
    content: "Insert children here";
    font-family: sans-serif;
    color: grey;
    font-size: 16px;
  }

  </style>
`;

export const useFrameContainer = ({
  mount,
  frameIndex,
  onLoad = noop,
  onInjectedExtraHTML,
  fullscreen,
  extraHTML,
}: UseFrameContainerProps) => {
  const frameRef = useRef<HTMLDivElement>();
  const [internalMount, setInternalMount] = useState<HTMLElement>(null);
  const extraHTMLContainer = useMemo(() => {
    return document.createElement("div");
  }, []);

  useEffect(() => {
    extraHTMLContainer.innerHTML = defaultExtraHTML + (extraHTML ?? "");
    onInjectedExtraHTML && onInjectedExtraHTML();
  }, [extraHTMLContainer, extraHTML]);

  useEffect(() => {
    setInternalMount(mount);
  }, [mount]);

  useEffect(() => {
    if (!frameRef.current || !mount) {
      return;
    }

    const existingIframe = frameRef.current.childElementCount
      ? (frameRef.current.childNodes[0] as HTMLIFrameElement)
      : null;

    const onIframeLoad = (ev: Event) => {
      const iframe = ev.target as HTMLIFrameElement;
      iframe.contentDocument.body.appendChild(mount);
      iframe.contentDocument.body.appendChild(extraHTMLContainer);

      // wait for the fonts to be loaded - will affect bounding rects
      (iframe.contentDocument as any).fonts.ready.then(() => {
        onLoad();
      });
    };

    if (internalMount === mount) {
      existingIframe.onload = onIframeLoad;
      return;
    }

    existingIframe?.remove();

    const iframe = document.createElement("iframe");
    // addresses https://github.com/paperclipui/paperclip/issues/310
    Object.assign(iframe.style, {
      border: "none",
      background: "transparent",
      width: "100%",
      height: "100%",
    });
    iframe.srcdoc = `
    <!doctype html>
    <html>
      <head>
        <style>
          html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
          }
        </style>
      </head>
      <body>
      </body>
    </html>
  `;

    iframe.onload = onIframeLoad;
    frameRef.current.appendChild(iframe);
    setInternalMount(mount);
  }, [frameRef, frameIndex, mount, onLoad]);

  const syncOverflow = () => {
    const doc = (frameRef.current.children[0] as HTMLIFrameElement)
      ?.contentDocument;
    if (doc) {
      const overflow = fullscreen ? "scroll" : "hidden";
      doc.body.style.overflow = overflow;
      if (!fullscreen) {
        doc.body.scrollTop = 0;
        doc.body.scrollLeft = 0;
      }
    }
  };

  useEffect(syncOverflow, [fullscreen]);

  return { ref: frameRef };
};
