import { Logger } from "@common/index";
import { variables } from "environment";

import { fromblackxblue } from "./blackxblue";
import { fromCollection } from "./collection";

export async function getAnswer() {
  if (!variables.values.config.animad.quiz.autoAnswer) {
    Logger.info("Auto answer for animad quiz is disabled.");

    throw new Error("Auto answer for animad quiz is disabled.");
  }

  try {
    const answer = await fromblackxblue();

    Logger.info("Got the answer from blackxblue:", answer);

    return answer;
  } catch (error) {
    Logger.error("Failed to get the answer from blackxblue.", error);
  }

  try {
    const answer = await fromCollection();

    Logger.info("Got the answer from the quiz collection:", answer);

    return answer;
  } catch {
    Logger.error("Failed to get the answer from the quiz collection.");
  }

  throw new Error("Failed to get any answer.");
}
