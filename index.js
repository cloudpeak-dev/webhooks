require("dotenv").config();
require("express-async-errors");

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const { spawn } = require("child_process");

const port = process.env.PORT || 8080;

// Create the express app
const app = express();

// Security Setup
app.disable("x-powered-by");
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

// Routes
app.get("/", async (req, res) => {
  // Start the command process
  const process = spawn("dokku ps:rebuild portfolio", []);

  // Set the response headers for streaming
  res.setHeader("Content-Type", "text/plain");

  // Send output as data comes in
  process.stdout.on("data", (data) => {
    res.write(data); // Write the output chunk to the response
  });

  process.stderr.on("data", (data) => {
    res.write(`Error: ${data}`);
  });

  process.on("close", (code) => {
    res.write(`\nProcess exited with code ${code}`);
    res.end(); // End the response once the process completes
  });

  process.on("error", (error) => {
    res.write(`\nFailed to start process: ${error.message}`);
    res.end(); // End the response in case of an error
  });
});

app.listen(port, () => {
  console.log(`⚡️ [SERVER]: Server is running at http://localhost:${port}`);
});
