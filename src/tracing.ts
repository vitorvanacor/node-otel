import { api } from "@opentelemetry/sdk-node";

export function getActiveSpan() {
  return api.trace.getActiveSpan();
}

export class TraceProvider {
  constructor(private name: string, private version: string) {}

  async withSpan(spanName, func: (span: api.Span) => void) {
    const tracer = api.trace.getTracer(this.name, this.version);
    tracer.startActiveSpan(spanName, async (span) => {
      try {
        await func(span);
        span.setStatus({ code: api.SpanStatusCode.OK }).end();
      } catch (err) {
        span.recordException(err);
        span.setStatus({ code: api.SpanStatusCode.ERROR }).end();
        throw err;
      }
    });
  }
}
