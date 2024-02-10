import { type QuizContent } from "@common/types/animad";
import { HttpService } from "services";

interface ErrorResponse {
  error: 1;
  /**
   * Error message
   * @example "今日已經答過題目了，一天僅限一次機會"
   */
  msg: string;
}

let quiz: QuizContent | undefined;

/**
 * Get the quiz of the day.
 * @throws {ErrorResponse} If the quiz is answered today.
 */
export async function getQuiz() {
  if (quiz) return quiz;

  const uri = "https://ani.gamer.com.tw/ajax/animeGetQuestion.php";
  const response = await HttpService.get<QuizContent | ErrorResponse>(uri, {
    responseType: "json",
  });

  if ("error" in response) return Promise.reject(response);

  quiz = response;

  return response;
}

interface QuizAnswerResult {}

/**
 * Submit the answer of the quiz.
 * @param token By default, it will auto fetch from cached quiz. You can provide
 * the token manually instead.
 * @throws {ErrorResponse} When there are error message from api.
 */
export async function submitAnswer(answer: number) {
  const token = quiz?.token || (await getQuiz()).token;

  const uri = "https://ani.gamer.com.tw/ajax/animeAnsQuestion.php";
  const params = new URLSearchParams();

  params.append("ans", answer.toString());
  params.append("token", token);
  params.append("t", Date.now().toString());

  const response = await HttpService.post<QuizAnswerResult | ErrorResponse>(
    uri,
    {
      data: params as unknown as string,
      responseType: "json",
    },
  );

  if ("error" in response) return Promise.reject(response);

  return response;
}
