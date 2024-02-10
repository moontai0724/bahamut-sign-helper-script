import { Logger } from "@common/index";
import { constants, variables } from "environment";

import * as AnswerSource from "./answer-source";
import { isTodayAnswered, submitAnswer } from "./helpers";
import * as ManualAnswer from "./manual-answer";

export { AnswerSource, ManualAnswer };

async function performAutoAnswer() {
  const answer = await AnswerSource.getAnswer();

  return submitAnswer(answer);
}

function graceTimePassed() {
  const { graceTime } = variables.values.config.animad.quiz;

  if (graceTime <= 0) return true;

  const now = new Date();

  return now.getTime() - constants.TODAY.start.getTime() >= graceTime;
}

async function performManualAnswer() {
  return ManualAnswer.init();
}

// 動畫瘋答題感謝 maple3142/動畫瘋工具箱 支援：https://greasyfork.org/zh-TW/scripts/39136
export async function init() {
  try {
    if (!variables.values.enable.animadQuiz) {
      Logger.info("Animad quiz feature is disabled.");

      return;
    }

    if (await isTodayAnswered()) {
      Logger.info("Animad quiz is already answered.");

      return;
    }

    try {
      const result = await performAutoAnswer();

      Logger.info("Successfully auto answered the animad quiz.", result);
    } catch {
      Logger.info(
        "Failed to auto answer the animad quiz, fallback to manual answer.",
      );

      if (!graceTimePassed()) {
        Logger.info(
          "Grace time is not passed, aborting manual answer for animad quiz.",
        );

        return;
      }

      await performManualAnswer();
    }
  } catch (error) {
    Logger.error("Encountered an error while performing animad quiz:", error);
  }
}
