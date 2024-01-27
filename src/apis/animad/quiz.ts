import { constants } from "environment";
import { HttpService } from "services";

interface ErrorResponse {
  error: 1;
  /**
   * Error message
   * @example "今日已經答過題目了，一天僅限一次機會"
   */
  msg: string;
}

export interface QuizContent {
  /**
   * Answer 1
   * @example "白色與黑色。"
   */
  a1: "白色與黑色。";
  /**
   * Answer 2
   * @example "紫色與藍色。"
   */
  a2: "紫色與藍色。";
  /**
   * Answer 3
   * @example "藍色與白色。"
   */
  a3: "藍色與白色。";
  /**
   * Answer 4
   * @example "紅色與紫色。"
   */
  a4: "紅色與紫色。";
  /**
   * Related game/board
   * @example "虛擬 Youtuber（Vtuber）"
   */
  game: string;
  /**
   * Question content
   * @example "Vtuber〔兔田佩可拉〕初始造型的麻花雙辮是用哪兩種顏色的頭髮編綁而成的？"
   */
  question: string;
  /**
   * CSRF Token
   */
  token: string;
  /**
   * Account of the user who published the quiz
   */
  userid: string;
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
export async function submitAnswer(
  answer: number,
  token: string | undefined = quiz?.token,
) {
  if (!token) throw new Error("Token is not provided.");

  const uri = "https://ani.gamer.com.tw/ajax/animeSubmitQuestion.php";
  const params = new FormData();

  params.append("answer", answer.toString());
  params.append("token", token);
  params.append("userid", constants.BAHAID);

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
