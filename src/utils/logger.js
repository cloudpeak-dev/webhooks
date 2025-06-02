import { createLogger, format, transports } from "winston";
import LokiTransport from "winston-loki";
const { combine, timestamp, prettyPrint, colorize, errors } = format;

// https://stackoverflow.com/questions/47231677/how-to-log-full-stack-trace-with-winston-3
const logger = createLogger({
  format: combine(
    errors({ stack: true }),
    colorize(),
    timestamp(),
    prettyPrint()
  ),
  transports: [
    new transports.Console(),

    new LokiTransport({
      // LokiTransport is attached to monitoring_default network
      host: "http://loki:3100",
      labels: { app: "webhooks-winston" },
      json: true,
      format: format.json(),
      replaceTimestamp: true,
      onConnectionError: (err) => console.error(err),
    }),
  ],
});

export { logger };
