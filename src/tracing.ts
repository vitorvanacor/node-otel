import {
  resources as Resources,
  node as SdkTraceNode,
  tracing as SdkTraceBase,
  api as Api,
} from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { ExpressInstrumentation } from "@opentelemetry/instrumentation-express";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";

const { Resource } = Resources;
const { NodeTracerProvider } = SdkTraceNode;
const { SimpleSpanProcessor, BatchSpanProcessor, ConsoleSpanExporter } =
  SdkTraceBase;
const {
  context,
  trace,
  diag,
  DiagConsoleLogger,
  DiagLogLevel,
  SpanStatusCode,
} = Api;

const config = {
  debug: false,
  consoleExporter: process.env.OTEL_CONSOLE_EXPORTER || true,
  otlpTraceExporter: process.env.OTEL_OTLP_TRACE_EXPORTER || true,
};

setupTracing();

export function setupTracing() {
  console.log("setting up tracing");
  const { consoleExporter, otlpTraceExporter } = config;

  // Not functionally required but gives some insight what happens behind the scenes
  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

  const resource = new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: process.env.SERVICE_NAME,
  });
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
