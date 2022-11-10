import {
  HostMetrics,
  MetricsCollectorConfig,
} from "@opentelemetry/host-metrics";
import { PrometheusExporter } from "@opentelemetry/exporter-prometheus";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import * as sdk from "@opentelemetry/sdk-node";
const { MeterProvider, PeriodicExportingMetricReader } = sdk.metrics;
import { resource } from "./resource";

// Provider
const meterProvider = new MeterProvider({ resource });

// Prometheus Exporter
const { endpoint, port } = PrometheusExporter.DEFAULT_OPTIONS;
const prometheusExporter = new PrometheusExporter({}, () => {
  console.log(
    `prometheus scrape endpoint: http://localhost:${port}${endpoint}`
  );
});
meterProvider.addMetricReader(prometheusExporter);
// OTLP Exporter
const otlpExporter = new OTLPMetricExporter();
meterProvider.addMetricReader(
  new PeriodicExportingMetricReader({
    exporter: otlpExporter,
    exportIntervalMillis: 5000,
  })
);

// Host Metrics
const hostMetrics = new HostMetrics({
  name: "example-host-metrics",
  meterProvider:
    meterProvider as unknown as MetricsCollectorConfig["meterProvider"],
});
hostMetrics.start();

// Meter
const meter = meterProvider.getMeter("example-meter");
export const requestCounter = meter.createCounter("requests", {
  description: "Example Request Counter",
});
