declare const ENVIRONMENT: any;

type Env = {
  host: string;
  protocol: string;
  initialFile: string;
};

const getDefaultEnv = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return {
    host: window.location.host,
    protocol: window.location.protocol,
    initialFile: urlParams.get("file"),
  };
};

export const env: Env =
  typeof ENVIRONMENT != "undefined" ? ENVIRONMENT : getDefaultEnv();
