// tracing with sdk-trace-node
import { Resource } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import {
  SimpleSpanProcessor,
  BatchSpanProcessor,
  ConsoleSpanExporter,
} from "@opentelemetry/sdk-trace-base";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { ExpressInstrumentation } from "@opentelemetry/instrumentation-express";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import {
  context,
  trace,
  diag,
  DiagConsoleLogger,
  DiagLogLevel,
  SpanStatusCode,
} from "@opentelemetry/api";

const defaultConfig = {
  debug: false,
  consoleExporter: false,
}

export function setupTracing(serviceName, config = {}) {
  config = {...defaultConfig, ...config}

  // Not functionally required but gives some insight what happens behind the scenes
  if (config.debug) diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

  const resource = new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
  });
  const provider = new NodeTracerProvider({ resource });

  if (config.consoleExporter) {
    provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
  } else {
    provider.addSpanProcessor(new BatchSpanProcessor(new OTLPTraceExporter()));
  }

  // Registering provider before instrumentation
  provider.register();

  registerInstrumentations({
    instrumentations: [new HttpInstrumentation(), new ExpressInstrumentation()],
  });
}

export function withSpan(tracerName, spanName, func) {
  const tracer = trace.getTracer(tracerName);
  const span = tracer.startSpan(spanName);
  try {
    func(span)
    span.setStatus(SpanStatusCode.OK);
  } catch(err) {
    span.recordException(err)
    span.setStatus(SpanStatusCode.ERROR);
  } finally {
    span.end()
  }
}