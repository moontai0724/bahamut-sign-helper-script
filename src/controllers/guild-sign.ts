import { GuildSignApi } from "apis";
import { variables } from "environment";
import { LoggerUtil } from "utils";

async function getMyGuildIds() {
  const infos = await GuildSignApi.getMyGuilds();
  const ids = infos.map(info => info.sn);

  return ids;
}

function isNotSignedYet(id: number) {
  const record = variables.getRecord();

  return !record.signedGuilds?.includes(id);
}

async function getUnsignedGuildIds() {
  const ids = await getMyGuildIds();
  const unsignedIds = ids.filter(isNotSignedYet);

  return unsignedIds;
}

async function setSigned(id: number) {
  const existing = variables.getRecord();

  if (!existing.signedGuilds) existing.signedGuilds = [];
  if (existing.signedGuilds.includes(id)) return existing;

  existing.signedGuilds.push(id);

  return existing;
}

async function sign(id: number) {
  if (!isNotSignedYet(id)) {
    throw new Error(`Guild ${id} is already signed today.`);
  }

  const signResult = await GuildSignApi.sign(id).catch(error => {
    if (error.msg === "您今天已經簽到過了！") {
      return Promise.resolve();
    }

    return Promise.reject(error);
  });

  setSigned(id);

  return signResult;
}

export default async function initGuildSign() {
  try {
    const ids = await getUnsignedGuildIds();

    if (!ids.length) {
      LoggerUtil.info("All guild sign is already performed.");

      return;
    }
    const results = await Promise.allSettled(ids.map(sign));

    LoggerUtil.info("Successfully performed guild sign!", results);
  } catch (error) {
    LoggerUtil.error(
      "Encountered an error while performing guild sign:",
      error,
    );
  }
}
