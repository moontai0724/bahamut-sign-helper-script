import { DailySignApi } from "apis";
import { constants, variables } from "environment";
import { type AccountSignRecord } from "environment/variables";
import { LoggerUtil } from "utils";

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
    LoggerUtil.info("Daily sign feature is disabled.");

    return;
  }

  if (await isTodaySigned()) {
    LoggerUtil.info("Daily sign is already performed.");

    return;
  }

  try {
    const signResult = await sign();

    LoggerUtil.info("Successfully performed daily sign!", signResult);
  } catch (error) {
    LoggerUtil.error(
      "Encountered an error while performing daily sign:",
      error,
    );
  }
}
