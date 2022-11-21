import "./setup-instrumentations-on-import";
import { getInstrumentations } from "./instrumentation";
import * as otel from "@opentelemetry/sdk-node";
import { createMeterProvider } from "./metrics";
import { awsEcsDetector } from "@opentelemetry/resource-detector-aws";
import { OTEL_LOG_LEVEL } from "./environment";
import { setupGlobalLogger } from "./logger";

const {
  envDetector,
  processDetector,
  osDetector,
  hostDetector,
  detectResources,
} = otel.resources;

export class Telemetry {
  private sdk: otel.NodeSDK;
  private meterProvider?: otel.metrics.MeterProvider;

  constructor() {
    // We will detect resources manually in order to pass the resource to the MeterProvider
    const autoDetectResources = false;
    const instrumentations = getInstrumentations();
    this.sdk = new otel.NodeSDK({ autoDetectResources, instrumentations });
  }

  async start() {
    const resource = await detectResources({
      detectors: [
        envDetector,
        processDetector,
        osDetector,
        hostDetector,
        awsEcsDetector,
      ],
    });
    this.sdk.addResource(resource);
    // In order to have multiple metric readers, we manually create MeterProvider (instead of letting NodeSDK create it)
    this.meterProvider = createMeterProvider(resource);
    otel.api.metrics.setGlobalMeterProvider(this.meterProvider);

    await this.sdk.start();
    if (OTEL_LOG_LEVEL !== otel.api.DiagLogLevel.VERBOSE) {
      setupGlobalLogger(otel.api.DiagLogLevel.INFO);
    }
  }

  async dispose() {
    await this.meterProvider?.shutdown();
    await this.sdk.shutdown();
  }
}
