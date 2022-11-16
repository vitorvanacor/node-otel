import * as otel from "@opentelemetry/sdk-node";
import { OTEL_LOG_LEVEL } from "./environment";

const { diag, DiagConsoleLogger } = otel.api;

export function setupGlobalLogger(logLevel = OTEL_LOG_LEVEL) {
  diag.setLogger(new DiagConsoleLogger(), {
    suppressOverrideMessage: true,
    logLevel,
  });
}

export { diag as logger };
