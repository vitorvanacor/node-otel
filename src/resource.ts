import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
import * as sdk from "@opentelemetry/sdk-node";
const { diag, DiagConsoleLogger, DiagLogLevel } = sdk.api;
const { Resource } = sdk.resources;

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

export const resource = new Resource({
  [SemanticResourceAttributes.SERVICE_NAME]: process.env.SERVICE_NAME,
});
