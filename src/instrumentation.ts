import { Instrumentation } from "@opentelemetry/instrumentation";
import { ExpressInstrumentation } from "@opentelemetry/instrumentation-express";
import { getHttpInstrumentation } from "./http-instrumentation";

let instrumentations: Instrumentation[];

export function getInstrumentations() {
  if (!instrumentations) {
    instrumentations = [getHttpInstrumentation(), new ExpressInstrumentation()];
  }
  return instrumentations;
}
