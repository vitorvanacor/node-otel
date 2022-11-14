import {
  HostMetrics,
  MetricsCollectorConfig,
} from "@opentelemetry/host-metrics";
import { PrometheusExporter } from "@opentelemetry/exporter-prometheus";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import * as otel from "@opentelemetry/sdk-node";

export class MetricsProvider {
  meterProvider: otel.metrics.MeterProvider;

  constructor(resource: otel.resources.Resource) {
    // Provider
    this.meterProvider = new otel.metrics.MeterProvider({ resource });

    // Prometheus Exporter
    const { endpoint, port } = PrometheusExporter.DEFAULT_OPTIONS;
    const prometheusExporter = new PrometheusExporter({}, () => {
      console.log(
        `prometheus scrape endpoint: http://localhost:${port}${endpoint}`
      );
    });
    this.meterProvider.addMetricReader(prometheusExporter);
    // OTLP Exporter
    const otlpExporter = new OTLPMetricExporter();
    this.meterProvider.addMetricReader(
      new otel.metrics.PeriodicExportingMetricReader({
        exporter: otlpExporter,
        exportIntervalMillis: 5000,
      })
    );

    // Host Metrics
    const hostMetrics = new HostMetrics({
      name: "example-host-metrics",
      meterProvider: this
        .meterProvider as unknown as MetricsCollectorConfig["meterProvider"],
    });
    hostMetrics.start();
  }

  async dispose() {
    await this.meterProvider.shutdown();
  }
}

export class RequestMetrics {
  private requestCounter: otel.api.Counter;

  constructor(meterProvider: otel.metrics.MeterProvider) {
    const requestMeter = meterProvider.getMeter("server-metrics", "0.0.1");
    this.requestCounter = requestMeter.createCounter("request-count", {});
  }

  incrementRequestCount() {
    this.requestCounter.add(1);
  }
}
