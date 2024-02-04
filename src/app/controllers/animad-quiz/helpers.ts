import { AnimadApi } from "apis";
import { variables } from "environment";

export function setAnswerStatus(status: boolean) {
  const existing = variables.getRecord();

  existing.animadQuizAnswered = status;

  return existing;
}

export async function isTodayAnswered() {
  const record = variables.getRecord();
  const answered = !!record.animadQuizAnswered;

  if (answered) return true;

  try {
    await AnimadApi.Quiz.getQuiz();
  } catch {
    setAnswerStatus(true);

    return true;
  }

  return false;
}

export async function submitAnswer(answer: number) {
  const result = await AnimadApi.Quiz.submitAnswer(answer).catch(error => {
    if (error.msg === "答題錯誤") return error;
    if (error.msg === "今日已經答過題目了，一天僅限一次機會") return error;

    throw error;
  });

  setAnswerStatus(true);

  return result;
}
