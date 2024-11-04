import "express-async-errors";
import stripAnsi from "strip-ansi";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import axios from "axios";
import { spawn } from "child_process";

const port = process.env.PORT || 8080;

// Create the express app
const app = express();

// Security Setup
app.set("trust proxy", 1 /* number of proxies between user and server */);

app.use(helmet());
app.use(cors());
app.use(
  rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 1 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  })
);

// Parsing
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Health: OK");
});

// Routes
let outputLog = ""; // Variable to store command output

app.post("/exec", async (req, res) => {
  if (req.body.KEY !== process.env.WEBHOOK_KEY) {
    res.status(400).send("wrong key");

    return;
  }

  outputLog = ""; // Reset the log

  // Command to run with arguments separated
  const command = "dokku";
  const args = ["ps:rebuild", "portfolio"];

  // Start the command process
  const spawn_process = spawn(command, args, { shell: true });

  spawn_process.stdout.on("data", (data) => {
    const cleanData = stripAnsi(data.toString()); // Strip ANSI codes
    console.log(data.toString());
    outputLog += cleanData + "\n"; // Append output to the log
  });

  spawn_process.stderr.on("data", async (data) => {
    // await axios.post("https://webhooks.datocms.com/2qpNGQSrtl/deploy-results", {
    //   status: "error",
    // });

    outputLog += `Error: ${data.toString()} \n`; // Append errors to the log
  });

  spawn_process.on("close", async (code) => {
    outputLog += `Process exited with code ${code}`;

    await axios.post("https://webhooks.datocms.com/2qpNGQSrtl/deploy-results", {
      status: "success",
    });
  });

  res.send("Command started");
});

app.get("/output", (req, res) => {
  res.setHeader("Content-Type", "text/plain");

  res.send(outputLog);
});

app.listen(port, () => {
  console.log(`⚡️ [SERVER]: Server is running at http://localhost:${port}`);
});
