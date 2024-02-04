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
