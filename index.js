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

const __dirname = path.resolve();
const port = 8080;

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
    await client.connect();
    // Send a ping to confirm a successful connection
    const collection = await client.db("webhooks").collection("rebuild");
    const b = await collection.find({}).toArray();

    const insertResult = await collection.insertOne({
      timestamp: "2021-10-01T00:00:00.000Z",
      output: `
        Error:  !     Herokuish builder not supported on arm64 servers.
 !     Switching to pack builder.
 
-----> Cleaning up...

-----> Building portfolio from cnb stack heroku/builder:24 (experimental)...

24: Pulling from heroku/builder

ea4ac7c2aed5: Already exists

e8b5c36be533: Already exists

0c8b626fa85b: Already exists

182afb1fe5dc: Already exists

0bd067b86436: Already exists

a51493e559ab: Already exists

2937dc358ed0: Pulling fs layer
45b79f579fd6: Pulling fs layer
5259751901b7: Pulling fs layer
4433e07c4e5c: Pulling fs layer
f12bcdeed161: Pulling fs layer
7c9f26fa62c3: Pulling fs layer
5beddbaf7f6a: Pulling fs layer
f5198fd7ffc1: Pulling fs layer
4433e07c4e5c: Waiting
5cb8a27411ae: Pulling fs layer
10c4d841b447: Pulling fs layer
d7b80a9b891f: Pulling fs layer
2cfd7f9473a8: Pulling fs layer
c6640de56b85: Pulling fs layer
1e0c08eeffce: Pulling fs layer
a4fea99767cd: Pulling fs layer
f63217451a36: Pulling fs layer
6d7ef2bdd402: Pulling fs layer
3a4558bbdea5: Pulling fs layer
cc400614ee19: Pulling fs layer
d3aa97ed2cb5: Pulling fs layer
f12bcdeed161: Waiting

63314c3d385a: Pulling fs layer
7c9f26fa62c3: Waiting
6fcf2eb8e0c9: Pulling fs layer
15e22ba63ae5: Pulling fs layer
5beddbaf7f6a: Waiting
4f4fb700ef54: Pulling fs layer
f5198fd7ffc1: Waiting
5cb8a27411ae: Waiting
10c4d841b447: Waiting
c6640de56b85: Waiting
d7b80a9b891f: Waiting
1e0c08eeffce: Waiting
2cfd7f9473a8: Waiting
d3aa97ed2cb5: Waiting
a4fea99767cd: Waiting
63314c3d385a: Waiting
6fcf2eb8e0c9: Waiting
f63217451a36: Waiting
15e22ba63ae5: Waiting
4f4fb700ef54: Waiting
6d7ef2bdd402: Waiting
cc400614ee19: Waiting
3a4558bbdea5: Waiting

45b79f579fd6: Verifying Checksum
45b79f579fd6: Download complete

5259751901b7: Verifying Checksum
5259751901b7: Download complete

4433e07c4e5c: Verifying Checksum
4433e07c4e5c: Download complete

2937dc358ed0: Verifying Checksum
2937dc358ed0: Download complete

2937dc358ed0: Pull complete

45b79f579fd6: Pull complete

f12bcdeed161: Verifying Checksum
f12bcdeed161: Download complete

5259751901b7: Pull complete

4433e07c4e5c: Pull complete

f12bcdeed161: Pull complete

7c9f26fa62c3: Download complete

7c9f26fa62c3: Pull complete

5beddbaf7f6a: Verifying Checksum
5beddbaf7f6a: Download complete

5beddbaf7f6a: Pull complete

f5198fd7ffc1: Download complete

f5198fd7ffc1: Pull complete

5cb8a27411ae: Verifying Checksum
5cb8a27411ae: Download complete

5cb8a27411ae: Pull complete

10c4d841b447: Verifying Checksum
10c4d841b447: Download complete

10c4d841b447: Pull complete

d7b80a9b891f: Verifying Checksum
d7b80a9b891f: Download complete

2cfd7f9473a8: Verifying Checksum
2cfd7f9473a8: Download complete
d7b80a9b891f: Pull complete

2cfd7f9473a8: Pull complete

c6640de56b85: Verifying Checksum
c6640de56b85: Download complete
c6640de56b85: Pull complete

1e0c08eeffce: Verifying Checksum
1e0c08eeffce: Download complete

1e0c08eeffce: Pull complete

a4fea99767cd: Verifying Checksum
a4fea99767cd: Download complete

a4fea99767cd: Pull complete

f63217451a36: Verifying Checksum
f63217451a36: Download complete

f63217451a36: Pull complete

cc400614ee19: Verifying Checksum
cc400614ee19: Download complete

6d7ef2bdd402: Verifying Checksum
6d7ef2bdd402: Download complete

6d7ef2bdd402: Pull complete

3a4558bbdea5: Verifying Checksum
3a4558bbdea5: Download complete

3a4558bbdea5: Pull complete

cc400614ee19: Pull complete

6fcf2eb8e0c9: Verifying Checksum
6fcf2eb8e0c9: Download complete

63314c3d385a: Verifying Checksum
63314c3d385a: Download complete

d3aa97ed2cb5: Verifying Checksum
d3aa97ed2cb5: Download complete

d3aa97ed2cb5: Pull complete

63314c3d385a: Pull complete
6fcf2eb8e0c9: Pull complete

4f4fb700ef54: Verifying Checksum
4f4fb700ef54: Download complete

15e22ba63ae5: Verifying Checksum
15e22ba63ae5: Download complete

15e22ba63ae5: Pull complete

4f4fb700ef54: Pull complete

Digest: sha256:05cd9612b9250d1f5ff38cedf36507e4f1c114f58f25005d246494a3cf83c09c

Status: Downloaded newer image for heroku/builder:24

24: Pulling from heroku/heroku

Digest: sha256:0dd9605531132c0dbb265d96f6e041f241c8fc596b46c584dd98c2c5ed3bf226
Status: Image is up to date for heroku/heroku:24

===> ANALYZING
Restoring data for SBOM from previous image
===> DETECTING
2 of 6 buildpacks participating
heroku/nodejs-engine      3.3.2
heroku/nodejs-npm-install 3.3.2
===> RESTORING
Restoring metadata for "heroku/nodejs-engine:dist" from app image
Restoring metadata for "heroku/nodejs-engine:node_runtime_metrics" from app image
Restoring metadata for "heroku/nodejs-engine:web_env" from app image
Restoring metadata for "heroku/nodejs-npm-install:npm_runtime_config" from app image
Restoring metadata for "heroku/nodejs-npm-install:npm_cache" from cache
Restoring data for "heroku/nodejs-engine:dist" from cache
Restoring data for "heroku/nodejs-npm-install:npm_cache" from cache

===> BUILDING


[Heroku Node.js Engine Buildpack]

[Checking Node.js version]

Detected Node.js version range: 20.11.1
Resolved Node.js version: 20.11.1

[Installing Node.js distribution]
Reusing Node.js 20.11.1 (linux-arm64)

Installing application metrics scripts


# Heroku Node.js npm Install Buildpack

- Installing node modules

  - Using npm version '10.2.4'

  - Restoring npm cache

  - Configuring npm cache directory

  - Running 'npm ci "--production=false"'


      npm WARN config production Use '--omit=dev' instead.

      npm WARN deprecated @babel/plugin-proposal-class-properties@7.18.6: This proposal has been merged to the ECMAScript standard and thus this plugin is no longer maintained. Please use @babel/plugin-transform-class-properties instead.

      npm WARN deprecated @babel/plugin-proposal-object-rest-spread@7.20.7: This proposal has been merged to the ECMAScript standard and thus this plugin is no longer maintained. Please use @babel/plugin-transform-object-rest-spread instead.

      
      added 810 packages, and audited 811 packages in 19s

      
      186 packages are looking for funding
        run 'npm fund' for details

      
      7 vulnerabilities (1 moderate, 6 high)
      
      To address issues that do not require attention, run:
        npm audit fix
      
      To address all issues, run:
        npm audit fix --force
      
      Run 'npm audit' for details.

            
  - Done (19.248s)
- Running scripts
  - Running 'npm run build'


      
      > portfolio_v2@0.1.0 prebuild
      > npm run codegen
      

      
      > portfolio_v2@0.1.0 codegen
      > graphql-codegen -r dotenv/config --config ./src/foundation/datocms/codegen.yml
      

      [STARTED] Parse Configuration
      [SUCCESS] Parse Configuration

      [STARTED] Generate outputs
      [STARTED] Generate to src/foundation/datocms/types/generated.ts
      [STARTED] Load GraphQL schemas

      [SUCCESS] Load GraphQL schemas
      [STARTED] Load GraphQL documents

      [SUCCESS] Load GraphQL documents
      [STARTED] Generate

      [SUCCESS] Generate

      [SUCCESS] Generate to src/foundation/datocms/types/generated.ts
      [SUCCESS] Generate outputs

      
      > portfolio_v2@0.1.0 build
      > next build
      

      Attention: Next.js now collects completely anonymous telemetry regarding usage.

      This information is used to shape Next.js' roadmap and prioritize features.
      You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
      https://nextjs.org/telemetry
      

         ▲ Next.js 14.0.0

      
         Creating an optimized production build ...

       ✓ Compiled successfully
         Linting and checking validity of types ...

         Collecting page data ...

         Generating static pages (0/11) ...

      
   Generating static pages (2/11) 

      
   Generating static pages (5/11) 

      
   Generating static pages (8/11) 

      
 ✓ Generating static pages (11/11) 

         Finalizing page optimization ...
         Collecting build traces ...

      

      Route (app)                                                   Size     First Load JS
      ┌ ○ /                                                         5.39 kB         163 kB
      ├ ○ /_not-found                                               875 B          88.6 kB
      ├ ○ /icon.png                                                 0 B                0 B
      ├ ○ /projects                                                 4.53 kB         110 kB
      └ ● /projects/[slug]                                          417 B           140 kB
          ├ /projects/devops-course-project-minitwit
          ├ /projects/finance-management-system-spendify
          ├ /projects/hosting-portfolio-website-on-the-home-server
          └ [+2 more paths]
      + First Load JS shared by all                                 87.7 kB
        ├ chunks/472-fc1126b146de7cb7.js                            32.4 kB
        ├ chunks/fd9d1056-09f261b597967129.js                       53.3 kB
        ├ chunks/main-app-9b9b15f32ca42195.js                       231 B
        └ chunks/webpack-428c0eb7e4bb72bd.js                        1.77 kB
      
      
      ○  (Static)  prerendered as static HTML
      ●  (SSG)     prerendered as static HTML (uses getStaticProps)
      

            
  - Done (40.523s)
- Configuring default processes
  - Adding default web process for 'npm start'
- Done (finished in 1m 0s)

===> EXPORTING

Reusing layer 'heroku/nodejs-engine:dist'

Reusing layer 'heroku/nodejs-engine:node_runtime_metrics'

Reusing layer 'heroku/nodejs-engine:web_env'

Reusing layer 'heroku/nodejs-npm-install:npm_runtime_config'

Reusing layer 'buildpacksio/lifecycle:launch.sbom'

Added 1/1 app layer(s)

Reusing layer 'buildpacksio/lifecycle:launcher'

Adding layer 'buildpacksio/lifecycle:config'
Reusing layer 'buildpacksio/lifecycle:process-types'

Adding label 'io.buildpacks.lifecycle.metadata'

Adding label 'io.buildpacks.build.metadata'
Adding label 'io.buildpacks.project.metadata'

Setting default process type 'web'
Saving dokku/portfolio:latest...

*** Images (8dcbc543185e):
      dokku/portfolio:latest
Reusing cache layer 'heroku/nodejs-engine:dist'
Adding cache layer 'heroku/nodejs-engine:dist'

Adding cache layer 'heroku/nodejs-npm-install:npm_cache'

Successfully built image 'dokku/portfolio:latest'

-----> Releasing portfolio...

-----> Checking for predeploy task
       No predeploy task found, skipping

-----> Checking for release task

       No release task found, skipping

=====> Processing deployment checks

Error: [1m[31m !     [0m[0mNo healthchecks found in app.json for web process type
 
       No web healthchecks found in app.json. Simple container checks will be performed.
       For more efficient zero downtime deployments, add healthchecks to your app.json. See https://dokku.com/docs/deployment/zero-downtime-deploys/ for examples

-----> Deploying portfolio via the docker-local scheduler...

-----> Deploying web (count=1)

       Attempting pre-flight checks (web.1)

-----> Executing 2 healthchecks
       Running healthcheck name='port listening check' attempts=3 port=5000 retries=2 timeout=5 type='listening' wait=5

       Running healthcheck name='default' type='uptime' uptime=10

       Healthcheck succeeded name='port listening check'

       Healthcheck succeeded name='default'
       All checks successful (web.1)
=====> Start of portfolio container output (a8dbbecba675 web.1)

       > portfolio_v2@0.1.0 start
       > next start
          ▲ Next.js 14.0.0
          - Local:        http://localhost:5000
        ✓ Ready in 432ms
=====> End of portfolio container output (a8dbbecba675 web.1)

       Scheduling old container shutdown in 60 seconds (web.1)

=====> Triggering early nginx proxy rebuild

-----> Ensuring network configuration is in sync for portfolio

-----> Configuring portfolio.minitwit.fun...(using built-in template)

-----> Creating http nginx.conf

       Reloading nginx

-----> Running post-deploy

-----> Ensuring network configuration is in sync for portfolio

-----> Configuring portfolio.minitwit.fun...(using built-in template)

-----> Creating http nginx.conf

       Reloading nginx

-----> Renaming containers

       Found previous container(s) (ba9f9ae2dd60) named portfolio.web.1

       Renaming container (ba9f9ae2dd60) portfolio.web.1 to portfolio.web.1.1731609730

       Renaming container portfolio.web.1.upcoming-16262 (a8dbbecba675) to portfolio.web.1

-----> Checking for postdeploy task
       No postdeploy task found, skipping

-----> Shutting down old containers in 60 seconds

=====> Application deployed:

       http://portfolio.minitwit.fun:8082


Process exited with code 0
      `,
    });
    console.log("Inserted documents =>", insertResult);

    // console.log(b);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);

app.post("/api/exec", async (req, res) => {
  if (req.body.KEY !== process.env.WEBHOOK_KEY) {
    res.status(400).send("wrong key");

    return;
  }

  outputLog = ""; // Reset the log

  // Command to run with arguments separated
  const command = "ssh";
  const args = ["rokas@ssh.minitwit.fun", "-T", "'dokku ps:rebuild portfolio'"];

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
