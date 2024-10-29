require("dotenv").config();
require("express-async-errors");

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const axios = require("axios");

const { exec } = require("child_process");

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

app.get("/health", (req, res) => {
  res.send("OK");
});

// Routes
app.post("/exec", async (req, res) => {
  if (req.body.KEY !== process.env.WEBHOOK_KEY) {
    res.status(400).send("wrong key");
    return;
  }

  exec("dokku ps:rebuild portfolio", async (err, stdout, stderr) => {
    if (err) {
      console.log(err);

      await axios.post(
        "https://webhooks.datocms.com/2qpNGQSrtl/deploy-results",
        { status: "error" }
      );

      return;
    }
    console.log("done");

    await axios.post("https://webhooks.datocms.com/2qpNGQSrtl/deploy-results", {
      status: "success",
    });
  });

  console.log("scheduled");

  res.send("exec scheduled");
});

app.listen(port, () => {
  console.log(`⚡️ [SERVER]: Server is running at http://localhost:${port}`);
});
