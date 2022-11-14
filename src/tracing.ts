import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { ExpressInstrumentation } from "@opentelemetry/instrumentation-express";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import * as otel from "@opentelemetry/sdk-node";

const { diag, DiagConsoleLogger, DiagLogLevel } = otel.api;
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

// Register as import side-effect
console.log("registering instrumentations");
registerInstrumentations({
  instrumentations: [new HttpInstrumentation(), new ExpressInstrumentation()],
});
console.log("instrumentations registered");

export class TraceProvider {
  constructor(private name: string, private version: string) {}

  async withSpan(spanName, func: (span: otel.api.Span) => void) {
    const tracer = otel.api.trace.getTracer(this.name, this.version);
    tracer.startActiveSpan(spanName, async (span) => {
      try {
        await func(span);
        span.setStatus({ code: otel.api.SpanStatusCode.OK }).end();
      } catch (err) {
        span.recordException(err);
        span.setStatus({ code: otel.api.SpanStatusCode.ERROR }).end();
        throw err;
      }
    });
  }

  getActiveSpan() {
    return otel.api.trace.getActiveSpan();
  }
}
