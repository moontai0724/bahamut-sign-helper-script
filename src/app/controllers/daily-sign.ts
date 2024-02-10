import { Logger } from "@common/index";
import { DailySignApi } from "apis";
import { variables } from "environment";
import { type AccountSignRecord } from "environment/variables";

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

export async function init() {
  try {
    if (!variables.values.enable.dailySign) {
      Logger.info("Daily sign feature is disabled.");

      return;
    }

    if (await isTodaySigned()) {
      Logger.info("Daily sign is already performed.");

      return;
    }

    const signResult = await sign();

    Logger.info("Successfully performed daily sign!", signResult);
  } catch (error) {
    Logger.error("Encountered an error while performing daily sign:", error);
  }
}
