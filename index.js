require("dotenv").config();
require("express-async-errors");

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const axios = require("axios");

const { spawn } = require("child_process");

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
let isRunning = false; // Track if the command is running

app.post("/exec", async (req, res) => {
  if (req.body.KEY !== process.env.WEBHOOK_KEY) {
    res.status(400).send("wrong key");

    return;
  }

  outputLog = ""; // Reset the log
  isRunning = true;

  // Command to run with arguments separated
  const command = "dokku";
  const args = ["ps:rebuild", "portfolio"];

  // Start the command process
  const spawn_process = spawn(command, args, { shell: true });

  spawn_process.stdout.on("data", (data) => {
    outputLog += data.toString(); // Append output to the log
  });

  spawn_process.stderr.on("data", async (data) => {
    console.log(data.toString());
    // await axios.post("https://webhooks.datocms.com/2qpNGQSrtl/deploy-results", {
    //   status: "error",
    // });

    outputLog += `Error: ${data.toString()}`; // Append errors to the log
  });

  spawn_process.on("close", async (code) => {
    outputLog += `\nProcess exited with code ${code}`;

    await axios.post("https://webhooks.datocms.com/2qpNGQSrtl/deploy-results", {
      status: "success",
    });

    isRunning = false;
  });

  res.send("Command started");
});

app.get("/output", (req, res) => {
  res.setHeader("Content-Type", "text/plain");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // Function to send data chunks at intervals
  const intervalId = setInterval(() => {
    if (outputLog) {
      res.write(outputLog); // Send accumulated output
      outputLog = ""; // Clear log after sending
    }
    if (!isRunning) {
      clearInterval(intervalId); // Stop the interval when done
      res.write("\nCommand completed.\n");
      res.end(); // End the response
    }
  }, 1000);

  // Clear interval if client closes the connection
  req.on("close", () => {
    clearInterval(intervalId);
  });
});

app.listen(port, () => {
  console.log(`⚡️ [SERVER]: Server is running at http://localhost:${port}`);
});
