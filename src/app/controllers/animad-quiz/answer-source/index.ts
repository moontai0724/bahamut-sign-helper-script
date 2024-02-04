import { variables } from "environment";
import { LoggerUtil } from "utils";

import { fromblackxblue } from "./blackxblue";
import { fromCollection } from "./collection";

export async function getAnswer() {
  if (!variables.values.config.animad.quiz.autoAnswer) {
    LoggerUtil.info("Auto answer for animad quiz is disabled.");

    throw new Error("Auto answer for animad quiz is disabled.");
  }

  try {
    const answer = await fromblackxblue();

    LoggerUtil.info("Got the answer from blackxblue:", answer);

    return answer;
  } catch (error) {
    LoggerUtil.error("Failed to get the answer from blackxblue.", error);
  }

  try {
    const answer = await fromCollection();

    LoggerUtil.info("Got the answer from the quiz collection:", answer);

    return answer;
  } catch {
    LoggerUtil.error("Failed to get the answer from the quiz collection.");
  }

  throw new Error("Failed to get any answer.");
}
