export interface QuizContent {
  /**
   * Answer 1
   * @example "白色與黑色。"
   */
  a1: string;
  /**
   * Answer 2
   * @example "紫色與藍色。"
   */
  a2: string;
  /**
   * Answer 3
   * @example "藍色與白色。"
   */
  a3: string;
  /**
   * Answer 4
   * @example "紅色與紫色。"
   */
  a4: string;
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

export interface QuizAnswerResult {
  /**
   * @example "恭喜您得到：100 巴幣"
   */
  gift: string;
  ok: 1;
}
