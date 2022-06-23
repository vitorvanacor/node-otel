// tracing with sdk-node
import { Resource } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { ExpressInstrumentation } from "@opentelemetry/instrumentation-express";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { diag, DiagConsoleLogger, DiagLogLevel, trace } from "@opentelemetry/api";

const defaultConfig = {
  debug: false,
}

export async function setupTracing(serviceName, config = {}) {
  config = {...defaultConfig, ...config}

  // Not functionally required but gives some insight what happens behind the scenes
  if (config.debug) diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

  const resource = new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
  });
  // OTLP exporter
  const traceExporter = new OTLPTraceExporter();

  const sdk = new NodeSDK({
    resource,
    traceExporter,
    instrumentations: [new HttpInstrumentation(), new ExpressInstrumentation()],
  });
  await sdk.start()
  console.log("SDK started")
}

