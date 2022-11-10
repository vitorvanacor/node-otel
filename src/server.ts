import { withSpan } from "./tracing";
import { requestCounter } from "./metrics";
import { context, trace } from "@opentelemetry/api";
import express from "express";

const PORT = Number(process.env.PORT) || "8080";

export async function start() {
  console.log("server.start");
  const app = express();

  app.get("/", (req, res) => {
    requestCounter.add(1);
    withSpan("my-traced-lib", "my-span", (span) => {
      span.setAttribute("my-span-attr", "attr created on setAttribute");
      span.addEvent("my-event");
    });

    const currentSpan = trace.getSpan(context.active());
    currentSpan?.updateName("UPDATED NAME");

    res.json(currentSpan?.spanContext() || "empty");
  });

  app.listen(PORT, () => {
    console.log(`Listening for requests on http://localhost:${PORT}`);
    trace.getTracer("server.js").startSpan("server started listening").end();
  });
}
