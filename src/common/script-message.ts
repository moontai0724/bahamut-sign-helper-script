import type { QuizContent } from "types/animad";

export enum ScriptEvent {
  SystemInit = "system-init",
  SystemRepliedResult = "system-replied-result",
  UserAnswered = "user-answered",
  UserClosed = "user-closed",
  ViewMounted = "view-mounted",
}

export interface ScriptMessage<Event extends ScriptEvent = ScriptEvent> {
  content?: unknown;
  scriptEvent: Event;
}

export interface OnUserAnswered
  extends ScriptMessage<ScriptEvent.UserAnswered> {
  content: number;
}

export interface OnSystemRepliedResult
  extends ScriptMessage<ScriptEvent.SystemRepliedResult> {
  content: string;
}

export interface OnUserClosed extends ScriptMessage<ScriptEvent.UserClosed> {}

export interface OnViewMounted extends ScriptMessage<ScriptEvent.ViewMounted> {}
export interface OnSystemInit extends ScriptMessage<ScriptEvent.SystemInit> {
  content: {
    question: QuizContent;
  };
}

export type ScriptMessageMap = {
  [ScriptEvent.UserAnswered]: OnUserAnswered;
  [ScriptEvent.SystemRepliedResult]: OnSystemRepliedResult;
  [ScriptEvent.UserClosed]: OnUserClosed;
  [ScriptEvent.ViewMounted]: OnViewMounted;
  [ScriptEvent.SystemInit]: OnSystemInit;
};

export function on<
  Event extends ScriptEvent,
  EventContext extends ScriptMessageMap[Event],
>(
  scriptEvent: Event,
  callback: (event: MessageEvent<EventContext>) => void,
  target: Window = window,
) {
  const listener = (event: MessageEvent<EventContext>) => {
    if (event.data.scriptEvent !== scriptEvent) return;

    callback(event);
  };

  target.addEventListener("message", listener);

  return listener;
}

export function send<
  Event extends ScriptEvent,
  EventContext extends ScriptMessageMap[Event],
  Content extends EventContext["content"],
>(scriptEvent: Event, content: Content, target: Window = window.parent) {
  const context = {
    content,
    scriptEvent,
  };

  return target.postMessage(context, "*");
}
