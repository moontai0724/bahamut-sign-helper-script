import { HomeApi } from "apis";
import { constants } from "environment";

function isToday(title: string) {
  const regex = /(\d{1,2})[/-](\d{1,2})/;
  const match = title.match(regex);

  if (!match) return false;

  const [, month, day] = match;
  const isMonthEqual = parseInt(month, 10) === constants.TODAY.month;
  const isDayEqual = parseInt(day, 10) === constants.TODAY.day;

  return isMonthEqual && isDayEqual;
}

function findAnswer(html: string) {
  const element = document.createElement("html");

  element.innerHTML = html;
  const postContent = element.querySelector("#home_content")?.textContent;

  if (!postContent) throw new Error("No post content found.");

  const answer = postContent.match(/[aAＡ]\s*.\s*([1-4１-４])/)?.[1];

  if (!answer) throw new Error("No answer found.");

  return parseInt(answer, 10);
}

export async function fromblackxblue() {
  const creations = await HomeApi.Creation.list("blackXblue");
  const todayCreation = creations.find(creation => isToday(creation.title));

  if (!todayCreation) throw new Error("No creation found.");

  const html = await HomeApi.Creation.getHTML(creations[0].csn);
  const answer = findAnswer(html);

  return answer;
}
