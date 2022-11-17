import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { logger } from "./logger";

let httpInstrumentation: HttpInstrumentation;

const HTTP_INSTRUMENTATION_IGNORE_INCOMING_PATHS = [
  "/metrics",
  "/health-check",
  "/v1/status",
];
const HTTP_INSTRUMENTATION_IGNORE_OUTGOING_PATHS = [
  "/v1/metrics",
  "/v1/traces",
];

export function getHttpInstrumentation() {
  if (httpInstrumentation) return httpInstrumentation;

  logger.debug(
    "HTTP_INSTRUMENTATION_IGNORE_INCOMING_PATHS",
    HTTP_INSTRUMENTATION_IGNORE_INCOMING_PATHS
  );
  logger.debug(
    "HTTP_INSTRUMENTATION_IGNORE_OUTGOING_PATHS",
    HTTP_INSTRUMENTATION_IGNORE_OUTGOING_PATHS
  );
  httpInstrumentation = new HttpInstrumentation({
    ignoreIncomingRequestHook: (req) => {
      return HTTP_INSTRUMENTATION_IGNORE_INCOMING_PATHS.includes(
        String(req.url)
      );
    },
    ignoreOutgoingRequestHook: (req) => {
      return HTTP_INSTRUMENTATION_IGNORE_OUTGOING_PATHS.includes(
        String(req.path)
      );
    },
  });
  return httpInstrumentation;
}
