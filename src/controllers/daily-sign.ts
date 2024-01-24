import { DailySignApi } from "apis";
import { constants, variables } from "environment";
import { type AccountSignRecord } from "environment/variables";

function getRecordCache(): AccountSignRecord {
  const record = variables.record[constants.BAHAID];

  if (!record) return {};
  if (record.updatedAt !== constants.TODAY.full) return {};

  return record;
}

function setSignStatus(status: boolean): AccountSignRecord {
  const existing: AccountSignRecord = getRecordCache();

  existing.dailySigned = status;
  existing.updatedAt = constants.TODAY.full;

  variables.record[constants.BAHAID] = existing;

  return existing;
}

async function isTodaySigned(): Promise<boolean> {
  const record = getRecordCache();

  if (!record.dailySigned) {
    const status = await DailySignApi.check();
    const signed = !!status.signin;

    setSignStatus(signed);

    return signed;
  }

  return !!record.dailySigned;
}

async function sign() {
  const signResult = await DailySignApi.sign();

  setSignStatus(true);

  return signResult;
}

export default async function initDailySign() {
  if (!variables.enable.dailySign) {
    console.info("Daily sign feature is disabled.");

    return;
  }

  if (await isTodaySigned()) {
    console.info("Daily sign is already performed.");

    return;
  }

  try {
    const signResult = await sign();

    console.info("Successfully performed daily sign!", signResult);
  } catch (error) {
    console.error("Encountered an error while performing daily sign:", error);
  }
}
