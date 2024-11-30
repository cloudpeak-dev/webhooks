class Log {
  #log;
  #date;

  constructor() {
    this.#log = "";
    this.#date = new Date().toISOString();
  }

  init() {
    this.#log = "";
    this.#date = new Date().toISOString();
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
}

export const log = new Log();
