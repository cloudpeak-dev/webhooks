import stripAnsi from "strip-ansi";
import { spawn } from "child_process";

import { insertLog } from "./mongodb.js";
import { getGithubLatestCommit } from "./utils/github.js";
import { log } from "./log.js";
import { logger } from "./utils/logger.js";

export const exec = (type, command, successCallback) => {
  // TODO: Check first if there is no dokku lock set

  log.init();

  try {
    const spawn_process = spawn(
      "ssh",
      ["rokas@host.docker.internal", "-T", command],
      { shell: true }
    );

    // https://man7.org/linux/man-pages/man7/signal.7.html
    setTimeout(() => {
      spawn_process.kill("SIGKILL");
    }, 10000);

    // logger.info(`Starting child process ${JSON.stringify(spawn_process)}`);

    spawn_process.stdout.on("data", (data) => {
      // Strip ANSI codes
      const cleanData = stripAnsi(data.toString());
      log.append(cleanData);
    });

    spawn_process.stderr.on("data", (data) => {
      log.append(data.toString());
    });

    spawn_process.on("close", async (code) => {
      log.append(`Process exited with code ${code}`);

      const githubCommit = await getGithubLatestCommit();

      const endDate = new Date();
      const runningTimeInSeconds =
        Math.abs(endDate - log.getStartDate()) / 1000;

      await insertLog({
        type: type,
        start_date: log.getStartDate(),
        running_time_in_seconds: runningTimeInSeconds,
        log: log.getLog(),
        githubCommitData: githubCommit,
        success: code === 0,
      });

      // Only Success
      if (successCallback) {
        await successCallback();
        return;
      }

      // TODO: Add error handling, the server crashes here
      // throw new Error("No success callback provided");
    });

    spawn_process.on("error", (error) => {
      throw error;
    });
  } catch (error) {
    throw error;
  } finally {
    log.finalize();
  }
};
