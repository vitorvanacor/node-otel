import "./tracing";
import * as otel from "@opentelemetry/sdk-node";
import { MetricsProvider } from "./metrics";

export class Telemetry {
  sdk: otel.NodeSDK;
  metricsProvider: MetricsProvider;

  constructor() {
    const resource = new otel.resources.Resource({});
    this.sdk = new otel.NodeSDK({ resource });
    this.metricsProvider = new MetricsProvider(resource);
  }

  async start() {
    console.log("Telemetry.start");
    await this.sdk.start();
    console.log("sdk started");
  }

  async dispose() {
    await this.metricsProvider.dispose();
    await this.sdk.shutdown();
  }
}
