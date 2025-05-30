import stripAnsi from "strip-ansi";
import { spawn } from "child_process";

import { insertLog } from "./mongodb.js";
import { log } from "./log.js";

export const exec = (type, command, successCallback) => {
  // TODO: Check first if there is no dokku lock set

  log.init();

  try {
    const spawn_process = spawn(
      "ssh",
      ["rokas@host.docker.internal", "-T", command],
      { shell: true }
    );

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

      await insertLog({
        type: type,
        date: log.getDate(),
        log: log.getLog(),
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
