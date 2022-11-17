import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { ExpressInstrumentation } from "@opentelemetry/instrumentation-express";
import { getHttpInstrumentation } from "./http-instrumentation";

export function setupInstrumentations() {
  registerInstrumentations({
    instrumentations: [getHttpInstrumentation(), new ExpressInstrumentation()],
  });
}
