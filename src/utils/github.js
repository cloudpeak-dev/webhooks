import axios from "axios";
import { logger } from "./logger.js";

const getGithubLatestCommit = async () => {
  try {
    const { data } = await axios.get(
      "https://api.github.com/repos/rokaskasperavicius/rokaskasperavicius/commits/main"
    );

    return data;
  } catch (error) {
    logger.error(error);

    return null;
  }
};

export { getGithubLatestCommit };
