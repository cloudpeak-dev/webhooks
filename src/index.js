import "dotenv/config";
import "express-async-errors";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";

import routes from "./routes.js";
import { PORT } from "./constants.js";

const __dirname = path.resolve();

// Create the express app
const app = express();

// Security Setup
app.set("trust proxy", 1 /* number of proxies between user and server */);

app.use(helmet());
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

// There are relative links in index.html.
// Therefore, we define static link from where to take the files
app.use(express.static(path.resolve(__dirname, "./client/dist")));

// Routes
app.use("/api", routes);

// Serve React App
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "./client/dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`⚡️ [SERVER]: Server is running at http://localhost:${PORT}`);
});
