import { renderFrames } from "@paperclip-ui/web-renderer";
import React, { useEffect, useRef } from "react";
import { EditorState } from "../../../machine/state";
import { useSelector } from "../../../modules/machine/hooks";

export const Frames = () => {
  const ref = useRef<HTMLDivElement>();
  const doc = useSelector(selectInfo);

  useEffect(() => {
    if (doc) {
      while (ref.current.childNodes.length) {
        ref.current.removeChild(ref.current.childNodes[0]);
      }
      const { html, css } = doc.toObject().paperclip;
      const els = renderFrames(
        { html, css, imports: [] },
        { domFactory: document }
      );
      console.log(els);
      for (const child of els) {
        ref.current.appendChild(child);
      }
    }
  }, [doc]);

  return <div ref={ref}></div>;
};

const selectInfo = (editor: EditorState) => editor.curentDocument;
