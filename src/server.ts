import { Telemetry } from "./telemetry";
import { ExpressMetrics } from "./express-metrics";
import express from "express";
import { getActiveSpan, TraceProvider } from "./tracing";

const PORT = Number(process.env.PORT) || "8080";

export async function start() {
  console.log("server.start");
  const telemetry = new Telemetry();
  const trace = new TraceProvider("my-traced-lib", "1.0.0");
  await telemetry.start();
  const expressMetrics = new ExpressMetrics();
  const app = express();

  app.get("/", (req, res) => {
    expressMetrics.incrementRequestCount();
    trace.withSpan("my-span", (span) => {
      span.setAttribute("my-span-attr", "attr created on setAttribute");
      span.addEvent("my-event");
    });

    const activeSpan = getActiveSpan();
    activeSpan?.updateName("UPDATED NAME");

    res.json(activeSpan?.spanContext() || "empty");
  });

  app.listen(PORT, () => {
    console.log(`Listening for requests on http://localhost:${PORT}`);
    trace.withSpan("server started listening", (span) => {
      span;
    });
  });
}
