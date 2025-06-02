class Log {
  #log;
  #dateStart;
  #dateEnd;
  #isRunning;

  constructor() {
    this.#log = "";
    this.#dateStart = new Date();
    this.#isRunning = false;
  }

  init() {
    this.#log = "";
    this.#dateStart = new Date();
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

  getStartDate() {
    return this.#dateStart;
  }

  isRunning() {
    return this.#isRunning;
  }
}

export const log = new Log();
