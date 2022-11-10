import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { ExpressInstrumentation } from "@opentelemetry/instrumentation-express";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import * as sdk from "@opentelemetry/sdk-node";
import { resource } from "./resource";

const { NodeTracerProvider } = sdk.node;
const { SimpleSpanProcessor, BatchSpanProcessor, ConsoleSpanExporter } =
  sdk.tracing;
const { trace, SpanStatusCode } = sdk.api;

const config = {
  debug: false,
  consoleExporter: process.env.OTEL_CONSOLE_EXPORTER || false,
  otlpTraceExporter: process.env.OTEL_OTLP_TRACE_EXPORTER || false,
};

// Setup as import side-effect
// setupTracing();

export function setupTracing() {
  console.log("setting up tracing");
  const { consoleExporter, otlpTraceExporter } = config;

  const provider = new NodeTracerProvider({ resource });

  if (consoleExporter) {
    provider.addSpanProcessor(
      new SimpleSpanProcessor(new ConsoleSpanExporter())
    );
  }
  if (otlpTraceExporter) {
    provider.addSpanProcessor(new BatchSpanProcessor(new OTLPTraceExporter()));
  }

  // Registering provider before instrumentation
  provider.register();

  registerInstrumentations({
    instrumentations: [new HttpInstrumentation(), new ExpressInstrumentation()],
  });
}

export async function withSpan(tracerName, spanName, func) {
  const tracer = trace.getTracer(tracerName);
  const span = tracer.startSpan(spanName);
  try {
    await func(span);
    span.setStatus({ code: SpanStatusCode.OK }).end();
  } catch (err) {
    span.recordException(err);
    span.setStatus({ code: SpanStatusCode.ERROR }).end();
    throw err;
  }
}
