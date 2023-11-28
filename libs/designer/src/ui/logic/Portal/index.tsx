import { useEffect, useMemo } from "react";
import ReactDOM from "react-dom";

export type PortalProps = {
  children: any;
};

export const Portal = ({ children }: PortalProps) => {
  const container = useMemo(() => {
    return document.createElement("div");
  }, []);

  useEffect(() => {
    document.body.appendChild(container);

    return () => {
      document.body.removeChild(container);
    };
  }, [container]);

  return ReactDOM.createPortal(children, container);
};
