import "./preview.scss";
import * as React from "react";
import { LightIDETextToken } from "./state";

export type PreviewComponentOuterProps = {
  tokens: LightIDETextToken[];
};

// TODO - create token factory
const BasePreviewComponent = ({ tokens }: PreviewComponentOuterProps) => (
  <div className="m-light-text-editor--preview">
    {tokens.map((token, i) => (
      <span key={token.type + i} className={`token ${token.type}`}>
        {token.value}
      </span>
    ))}
  </div>
);

export const PreviewComponent = BasePreviewComponent;
