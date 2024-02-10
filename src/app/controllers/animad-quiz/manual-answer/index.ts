import { ScriptMessage } from "@common/index";
import { ScriptEvent } from "@common/script-message";
import html from "@pages/animad-manual-answer/index.html";
import { AnimadApi } from "apis";
import { HtmlLoaderUtil, LoggerUtil } from "utils";

let iframe: HTMLIFrameElement;

function close() {
  iframe.remove();
  LoggerUtil.info("Manual answer animad quiz closed.");
}

export async function init() {
  const quiz = await AnimadApi.Quiz.getQuiz();

  LoggerUtil.info("Initiating manual answer animad quiz...");
  ScriptMessage.on(ScriptEvent.ViewMounted, event => {
    LoggerUtil.info("Manual answer animad quiz view mounted.");
    ScriptMessage.send(
      ScriptEvent.SystemInit,
      { question: quiz },
      event.source as Window,
    );
  });

  iframe = HtmlLoaderUtil.loadFullScreenIframe(html);

  ScriptMessage.on(ScriptEvent.UserClosed, close);
}
