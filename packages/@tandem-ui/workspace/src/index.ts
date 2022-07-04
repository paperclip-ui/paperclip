import { LogLevel } from "@paperclip-lang/common";
import { start } from "./server";

start({
  http: {
    port: Number(process.env.PORT || 3004),
  },
  logLevel: LogLevel.All,
});
