import { Logger, ScriptMessage } from "@common/index";
import { ScriptEvent } from "@common/script-message";
import html from "@pages/animad-manual-answer/index.html";
import { AnimadApi } from "apis";
import { HtmlLoaderUtil } from "utils";

let iframe: HTMLIFrameElement;

function close() {
  iframe.remove();
  Logger.info("Manual answer animad quiz closed.");
}

async function onUserAnswered(event: MessageEvent) {
  Logger.info("User answered manual answer animad quiz.", event);
  const answer = event.data.content;

  const result = await AnimadApi.Quiz.submitAnswer(answer).catch(error => ({
    gift: error.msg || error.message,
    ok: 0,
  }));

  ScriptMessage.send(
    ScriptEvent.SystemRepliedResult,
    result.gift,
    event.source as Window,
  );
}

export async function init() {
  const quiz = await AnimadApi.Quiz.getQuiz();

  Logger.info("Initiating manual answer animad quiz...");
  ScriptMessage.on(ScriptEvent.ViewMounted, event => {
    Logger.info("Manual answer animad quiz view mounted.");
    ScriptMessage.send(
      ScriptEvent.SystemInit,
      { question: quiz },
      event.source as Window,
    );
  });

  ScriptMessage.on(ScriptEvent.UserClosed, close);
  ScriptMessage.on(ScriptEvent.UserAnswered, onUserAnswered);

  iframe = HtmlLoaderUtil.loadFullScreenIframe(html);
}
