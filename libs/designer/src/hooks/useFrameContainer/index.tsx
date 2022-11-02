import { noop } from "lodash";
import { useEffect, useMemo, useRef, useState } from "react";

export type UseFrameContainerProps = {
  mount: HTMLElement;
  onLoad?: () => void;
  fullscreen?: boolean;
  extraHTML?: string;
};

export const useFrameContainer = ({
  mount,
  onLoad = noop,
  fullscreen,
  extraHTML,
}: UseFrameContainerProps) => {
  const frameRef = useRef<HTMLDivElement>();
  const [internalMount, setInternalMount] = useState<HTMLElement>(null);
  const extraHTMLContainer = useMemo(() => {
    return document.createElement("div");
  }, []);

  useEffect(() => {
    extraHTMLContainer.innerHTML = extraHTML || "";
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
      background: "white",
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
  }, [frameRef, mount, onLoad]);

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
