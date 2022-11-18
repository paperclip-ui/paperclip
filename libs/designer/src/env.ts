declare const ENVIRONMENT: any;

type Env = {
  host: string;
  protocol: string;
};

const getDefaultEnv = () => {
  return {
    host: window.location.host,
    protocol: window.location.protocol,
  };
};

export const env: Env =
  typeof ENVIRONMENT != "undefined" ? ENVIRONMENT : getDefaultEnv();
