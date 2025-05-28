import express from "express";
import { Webhooks } from "@octokit/webhooks";
import axios from "axios";
import { createLogger, format, transports } from "winston";
import LokiTransport from "winston-loki";
const { combine, timestamp, prettyPrint, colorize, errors } = format;

import { getLatestDate, getLogs, insertLog } from "./mongodb.js";
import { DATOCMS_WEBHOOK_SECRET, GITHUB_WEBHOOK_SECRET } from "./constants.js";
import { exec } from "./exec.js";
import { log } from "./log.js";

const app = express.Router();

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
      // TO DO: Fix LokiTransport as this attached monitoring_default network
      host: "http://loki:3100",
      labels: { app: "webhooks-winston" },
      json: true,
      format: format.json(),
      replaceTimestamp: true,
      onConnectionError: (err) => console.error(err),
    }),
  ],
});

const webhooks = new Webhooks({
  secret: GITHUB_WEBHOOK_SECRET,
});

app.get("/logs/current/status", (req, res) => {
  res.json({
    isRunning: log.isRunning(),
  });
});

app.get("/logs/current", (req, res) => {
  res.setHeader("Content-Type", "text/plain");

  res.send(log.getLog());
});

app.get("/logs", async (req, res) => {
  const logs = await getLogs();

  logger.info("Logs info message");
  logger.error(new Error("Logs error message"));

  res.json({
    results: logs,
  });
});

app.get("/meta", async (req, res) => {
  const date = await getLatestDate();

  res.json({ date });
});

app.post("/github", async (req, res) => {
  // Validate that the request is coming from GitHub
  const signature = req.headers["x-hub-signature-256"];
  const body = JSON.stringify(req.body);

  if (!(await webhooks.verify(body, signature))) {
    res.status(401).send("Unauthorized");
    return;
  }

  const command =
    "dokku git:sync --build rokaskasperavicius https://github.com/rokaskasperavicius/rokaskasperavicius.git";

  try {
    exec("github", command);
  } catch (error) {
    logger.error(error);
  }

  res.status(202).send("Webhook triggered");
});

app.post("/datocms/rebuild", async (req, res) => {
  // Validate that the request is coming from DatoCMS
  if (req.body.SECRET !== DATOCMS_WEBHOOK_SECRET) {
    res.status(401).send("Unauthorized");
    return;
  }

  const command = "dokku ps:rebuild rokaskasperavicius";

  try {
    exec("datocms", command, async () => {
      await axios.post(
        "https://webhooks.datocms.com/2qpNGQSrtl/deploy-results",
        {
          status: "success",
        }
      );
    });
  } catch (error) {
    logger.error(error);

    await axios.post("https://webhooks.datocms.com/2qpNGQSrtl/deploy-results", {
      status: "error",
    });
  }

  res.status(202).send("Webhook triggered");
});

app.post("/datocms/invalidate-cache", async (req, res) => {
  const token = req.query.token;

  try {
    await axios.post("https://www.rokas.site/api/invalidate-cache", null, {
      params: { token },
    });
  } catch (error) {
    logger.error(error);
    res.status(500).send("Something went wrong");

    return;
  }

  res.status(200).send("Cache invalidated");
});

export default app;
