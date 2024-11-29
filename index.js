import "dotenv/config";
import "express-async-errors";
import stripAnsi from "strip-ansi";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import axios from "axios";
import { spawn } from "child_process";
import path from "path";
import { MongoClient, ServerApiVersion } from "mongodb";
import { Webhooks } from "@octokit/webhooks";

const __dirname = path.resolve();
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

// There are relative links in index.html. Therefore, we define static link from where to take the files
app.use(express.static(path.resolve(__dirname, "./client/dist")));

app.get("/api", (req, res) => {
  res.json({ success: true });
});

// Routes
let outputLog = ""; // Variable to store command output
let outputDate = "";

const uri = `mongodb+srv://rokas:${process.env.MONGODB_KEY}@cluster0.qx51r.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    const collection = await client.db("webhooks").collection("rebuild");
    const b = await collection.find({}).toArray();

    const insertResult = await collection.insertOne({});
    console.log("Inserted documents =>", insertResult);

    // console.log(b);
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
// run().catch(console.dir);

const webhooks = new Webhooks({
  secret: process.env.GITHUB_WEBHOOK_SECRET,
});

app.post("/api/github", async (req, res) => {
  const signature = req.headers["x-hub-signature-256"];
  const body = await JSON.stringify(req.body);

  // Validate that the request is coming from GitHub
  if (!(await webhooks.verify(body, signature))) {
    res.status(401).send("Unauthorized");
    return;
  }

  outputLog = ""; // Reset the log
  outputDate = new Date().toISOString(); // Set the date

  const command = "ssh";
  const args = [
    "rokas@ssh.cloudpeak.dev",
    "-T",
    "'dokku git:sync --build portfolio https://github.com/rokaskasperavicius/rokaskasperavicius.git'",
  ];

  try {
    // Start the command process
    const spawn_process = spawn(command, args, { shell: true });

    spawn_process.stdout.on("data", (data) => {
      const cleanData = stripAnsi(data.toString()); // Strip ANSI codes
      outputLog += cleanData + "\n"; // Append output to the log
    });

    spawn_process.stderr.on("data", async (data) => {
      outputLog += `Error: ${data.toString()} \n`; // Append errors to the log
    });

    spawn_process.on("close", async (code) => {
      outputLog += `Process exited with code ${code}`;

      // Success
      if (code === 0) {
        const collection = await client.db("webhooks").collection("logs");
        await collection.insertOne({
          date: outputDate,
          log: outputLog,
          type: "github",
        });
      }
    });
  } catch (err) {
    console.error(err);
  }

  res.send("Command started");
});

app.post("/api/exec", async (req, res) => {
  if (req.body.SECRET !== process.env.DATOCMS_WEBHOOK_SECRET) {
    res.status(401).send("Unauthorized");
    return;
  }

  outputLog = ""; // Reset the log
  outputDate = new Date().toISOString(); // Set the date

  // Command to run with arguments separated
  const command = "ssh";
  const args = [
    "rokas@ssh.cloudpeak.dev",
    "-T",
    "'dokku ps:rebuild portfolio'",
  ];

  try {
    // Start the command process
    const spawn_process = spawn(command, args, { shell: true });

    spawn_process.stdout.on("data", (data) => {
      const cleanData = stripAnsi(data.toString()); // Strip ANSI codes
      outputLog += cleanData + "\n"; // Append output to the log
    });

    spawn_process.stderr.on("data", async (data) => {
      outputLog += `Error: ${data.toString()} \n`; // Append errors to the log
    });

    spawn_process.on("close", async (code) => {
      outputLog += `Process exited with code ${code}`;

      if (code === 0) {
        // Success
        const collection = await client.db("webhooks").collection("logs");
        await collection.insertOne({
          date: outputDate,
          log: outputLog,
          type: "datocms",
        });

        await axios.post(
          "https://webhooks.datocms.com/2qpNGQSrtl/deploy-results",
          {
            status: "success",
          }
        );
      } else {
        await axios.post(
          "https://webhooks.datocms.com/2qpNGQSrtl/deploy-results",
          {
            status: "error",
          }
        );
      }
    });

    spawn_process.on("error", async (err) => {
      await axios.post(
        "https://webhooks.datocms.com/2qpNGQSrtl/deploy-results",
        {
          status: "error",
        }
      );
    });
  } catch (err) {
    await axios.post("https://webhooks.datocms.com/2qpNGQSrtl/deploy-results", {
      status: "error",
    });
  }

  res.send("Command started");
});

app.get("/api/outputs", async (req, res) => {
  const collection = await client.db("webhooks").collection("rebuild");
  const b = await collection.find({}).toArray();

  res.json({
    results: b,
  });
});

app.get("/api/meta", async (req, res) => {
  const collection = await client.db("webhooks").collection("rebuild");
  const b = await collection.find({}, { sort: { date: -1 } }).toArray();

  res.json({
    date: b[0].date,
  });
});

app.get("/api/output", (req, res) => {
  res.setHeader("Content-Type", "text/plain");

  res.send(outputLog);
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "./client/dist", "index.html"));
});

app.listen(port, () => {
  console.log(`⚡️ [SERVER]: Server is running at http://localhost:${port}`);
});
