import * as otel from "@opentelemetry/sdk-node";
import { SemanticAttributes } from "@opentelemetry/semantic-conventions";
import { NextFunction, Request, Response } from "express";

export function expressMetricsMiddleware() {
  const requestMeter = otel.api.metrics.getMeter("express-metrics");
  const requestCounter = requestMeter.createCounter("request-count", {
    description: "Total request count",
    valueType: otel.api.ValueType.INT,
  });
  const activeRequests = requestMeter.createUpDownCounter("active-requests", {
    description: "Active requests",
    valueType: otel.api.ValueType.INT,
  });
  const latencyHistogram = requestMeter.createHistogram("request-latency", {
    description: "Latency",
    unit: "ms",
    valueType: otel.api.ValueType.INT,
  });

  return function middleware(req: Request, res: Response, next: NextFunction) {
    const startTime = new Date().getTime();
    activeRequests.add(1);
    res.once("finish", () => {
      const latency = new Date().getTime() - startTime;
      const attributes = {
        [SemanticAttributes.HTTP_METHOD]: req.method,
        [SemanticAttributes.HTTP_ROUTE]: req.route?.path,
        [SemanticAttributes.HTTP_STATUS_CODE]: String(res.statusCode),
      };
      requestCounter.add(1, attributes);
      activeRequests.add(-1);
      latencyHistogram.record(latency, attributes);
    });

    next();
  };
}
