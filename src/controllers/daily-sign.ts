import { DailySignApi } from "apis";
import { variables } from "environment";
import { type AccountSignRecord } from "environment/variables";
import { LoggerUtil } from "utils";

function setSignStatus(status: boolean) {
  const existing: AccountSignRecord = variables.getRecord();

  existing.dailySigned = status;

  return existing;
}

async function isTodaySigned(): Promise<boolean> {
  const record = variables.getRecord();

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
  if (!variables.values.enable.dailySign) {
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
