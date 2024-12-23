class Log {
  #log;
  #date;
  #isRunning;

  constructor() {
    this.#log = "";
    this.#date = new Date().toISOString();
    this.#isRunning = false;
  }

  init() {
    this.#log = "";
    this.#date = new Date().toISOString();
    this.#isRunning = true;
  }

  finalize() {
    this.#isRunning = false;
  }

  append(log) {
    this.#log += log;
  }

  getLog() {
    return this.#log;
  }

  getDate() {
    return this.#date;
  }

  isRunning() {
    return this.#isRunning;
  }
}

export const log = new Log();
