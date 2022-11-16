import * as otel from "@opentelemetry/sdk-node";

const logLevelMap: { [key: string]: otel.api.DiagLogLevel } = {
  ALL: otel.api.DiagLogLevel.ALL,
  VERBOSE: otel.api.DiagLogLevel.VERBOSE,
  DEBUG: otel.api.DiagLogLevel.DEBUG,
  INFO: otel.api.DiagLogLevel.INFO,
  WARN: otel.api.DiagLogLevel.WARN,
  ERROR: otel.api.DiagLogLevel.ERROR,
  NONE: otel.api.DiagLogLevel.NONE,
};
// Because we need to explicitly set the log level when calling diag.setLogger
export const OTEL_LOG_LEVEL = logLevelMap[process.env.OTEL_LOG_LEVEL ?? "INFO"];

// Because it is not yet supported by the otel lib
export const OTEL_METRICS_EXPORTER =
  process.env.OTEL_METRICS_EXPORTER || "none";

// Non-standard, but very useful
export const OTEL_EXPORTER_OTLP_METRICS_INTERVAL =
  Number(process.env.OTEL_EXPORTER_OTLP_METRICS_INTERVAL) || undefined;
