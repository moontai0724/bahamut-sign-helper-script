import { AnimadApi, QuizCollectionApi } from "apis";
import { variables } from "environment";
import { LoggerUtil } from "utils";

export async function fromCollection() {
  if (!variables.values.config.animad.quiz.source.collection) {
    const message = "The quiz collection answer source is disabled.";

    LoggerUtil.info(message);

    throw new Error(message);
  }

  const quiz = await AnimadApi.Quiz.getQuiz();
  const result = await QuizCollectionApi.find(quiz.question);

  if (!result.answer)
    throw new Error("Failed to find the answer from the quiz collection.");

  return result.answer;
}

export async function getAnswer() {
  if (!variables.values.config.animad.quiz.autoAnswer) {
    LoggerUtil.info("Auto answer for animad quiz is disabled.");

    throw new Error("Auto answer for animad quiz is disabled.");
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
