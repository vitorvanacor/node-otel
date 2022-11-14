import { Telemetry } from "./telemetry";
import { RequestMetrics } from "./metrics";
import express from "express";
import { TraceProvider } from "./tracing";

const PORT = Number(process.env.PORT) || "8080";

export async function start() {
  console.log("server.start");
  const telemetry = new Telemetry();
  const requestsMetrics = new RequestMetrics(
    telemetry.metricsProvider.meterProvider
  );
  const trace = new TraceProvider("my-traced-lib", "1.0.0");
  await telemetry.start();
  const app = express();

  app.get("/", (req, res) => {
    requestsMetrics.incrementRequestCount();
    trace.withSpan("my-span", (span) => {
      span.setAttribute("my-span-attr", "attr created on setAttribute");
      span.addEvent("my-event");
    });

    const currentSpan = trace.getActiveSpan();
    currentSpan?.updateName("UPDATED NAME");

    res.json(currentSpan?.spanContext() || "empty");
  });

  app.listen(PORT, () => {
    console.log(`Listening for requests on http://localhost:${PORT}`);
    trace.withSpan("server started listening", (span) => {
      console.log(span);
    });
  });
}
