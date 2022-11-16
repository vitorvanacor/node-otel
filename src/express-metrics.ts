import * as otel from "@opentelemetry/sdk-node";

export class ExpressMetrics {
  private requestCounter: otel.api.Counter;

  constructor() {
    const requestMeter = otel.api.metrics.getMeter("request-metrics");
    this.requestCounter = requestMeter.createCounter("request-count");
  }

  incrementRequestCount() {
    this.requestCounter.add(1);
  }
}
