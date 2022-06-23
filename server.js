import { require } from "./require.js";
import { setupTracing } from "./tracing-sdk.js";
import { context, SpanStatusCode, trace } from "@opentelemetry/api";
import { withSpan } from "./tracing.js";

const PORT = Number(process.env.PORT) || "8080";

export async function start() {
  console.log('server.start')
  await setupTracing("my-service", { debug: false, consoleExporter: true });
  const express = require('express')
  const server = express()

  server.get("/", (req, res) => {
    withSpan('my-traced-lib', 'my-span', (span) => {
      span.setAttribute('my-span-attr', 'attr created on setAttribute')
      span.addEvent('my-event')
    })

    const currentSpan = trace.getSpan(context.active())
    currentSpan.updateName('UPDATED NAME')

    res.json(currentSpan.spanContext());
  });

  server.listen(PORT, () => {
    console.log(`Listening for requests on http://localhost:${PORT}`);
    const tracer = trace.getTracer("server.js");
    tracer.startSpan("server started listening").end();
  });
}
