import { Logger } from "@common/index";
import { GuildApi } from "apis";
import { variables } from "environment";

async function getMyGuildIds() {
  const infos = await GuildApi.Info.getMyGuilds();
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

  const signResult = await GuildApi.Sign.sign(id).catch(error => {
    if (error.msg === "您今天已經簽到過了！") {
      return Promise.resolve(error);
    }

    return Promise.reject(error);
  });

  setSigned(id);

  return signResult;
}

export async function init() {
  try {
    const ids = await getUnsignedGuildIds();

    if (!ids.length) {
      Logger.info("All guild sign is already performed.");

      return;
    }
    const results = await Promise.allSettled(ids.map(sign));

    Logger.info("Successfully performed guild sign!", results);
  } catch (error) {
    Logger.error("Encountered an error while performing guild sign:", error);
  }
}
