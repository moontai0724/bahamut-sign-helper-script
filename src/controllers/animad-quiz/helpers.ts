import { AnimadApi } from "apis";
import { variables } from "environment";

export function setAnswerStatus(status: boolean) {
  const existing = variables.getRecord();

  existing.animadQuizAnswered = status;

  return existing;
}

export function isTodayAnswered(): boolean {
  const record = variables.getRecord();
  const answered = !!record.animadQuizAnswered;

  if (answered) return true;

  try {
    AnimadApi.Quiz.getQuiz();
  } catch {
    return true;
  }

  return false;
}

export function submitAnswer(answer: number) {
  const result = AnimadApi.Quiz.submitAnswer(answer);

  setAnswerStatus(true);

  return result;
}
