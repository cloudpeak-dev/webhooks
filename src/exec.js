import stripAnsi from "strip-ansi";
import { spawn } from "child_process";

import { insertLog } from "./mongodb.js";

export const exec = (log, type, command, successCallback) => {
  // TODO: Check first if there is no dokku lock set

  log.init();

  try {
    const spawn_process = spawn(
      "ssh",
      ["rokas@ssh.cloudpeak.dev", "-T", command],
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

      // Only Success
      if (code === 0) {
        await insertLog({
          type: type,
          date: log.getDate(),
          log: log.getLog(),
        });

        if (successCallback) await successCallback();

        return;
      }

      throw new Error(`Process exited with code ${code}`);
    });

    spawn_process.on("error", (error) => {
      throw error;
    });
  } catch (error) {
    throw error;
  }
};
