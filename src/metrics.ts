import {
  HostMetrics,
  MetricsCollectorConfig,
} from "@opentelemetry/host-metrics";
import { PrometheusExporter } from "@opentelemetry/exporter-prometheus";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import * as otel from "@opentelemetry/sdk-node";
import { logger } from "./logger";
import {
  OTEL_EXPORTER_OTLP_METRICS_INTERVAL,
  OTEL_METRICS_EXPORTER,
} from "./environment";

export function createMeterProvider(resource: otel.resources.Resource) {
  const meterProvider = new otel.metrics.MeterProvider({ resource });

  for (const reader of createMetricReadersFromEnv()) {
    meterProvider.addMetricReader(reader);
  }

  // Host Metrics
  const hostMetrics = new HostMetrics({
    name: "host-metrics",
    meterProvider:
      meterProvider as unknown as MetricsCollectorConfig["meterProvider"],
  });
  hostMetrics.start();

  return meterProvider;
}

function createMetricReadersFromEnv() {
  logger.debug("OTEL_METRICS_EXPORTER", OTEL_METRICS_EXPORTER);
  const exporterNames = OTEL_METRICS_EXPORTER.split(",");
  const readers: otel.metrics.MetricReader[] = [];
  if (exporterNames.includes("otlp")) {
    const otlpExporter = new OTLPMetricExporter();
    readers.push(
      new otel.metrics.PeriodicExportingMetricReader({
        exporter: otlpExporter,
        exportIntervalMillis: OTEL_EXPORTER_OTLP_METRICS_INTERVAL,
      })
    );
  }
  if (exporterNames.includes("prometheus")) {
    readers.push(new PrometheusExporter());
  }
  if (!readers.length && exporterNames[0] !== "none") {
    logger.warn("invalid OTEL_METRICS_EXPORTER", OTEL_METRICS_EXPORTER);
  }
  return readers;
}
