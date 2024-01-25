import { RecursiveProxyUtil } from "utils";

import { BAHAID, TODAY } from "./constants";

export interface AccountSignRecord {
  /**
   * Whether the account has signed daily sign today.
   */
  dailySigned?: boolean;
  /**
   * The date of the last sign.
   *
   * @example "2024/03/09"
   */
  updatedAt: string;
}

/**
 * Defines the environment variables here. The key of first level object will be
 * the identifier that stored into the script storage, and the value will be the
 * default value if the value is not set before.
 */
const environmentVariables = {
  enable: {
    /**
     * Whether to enable the daily sign feature.
     * @default true
     */
    dailySign: true,
  },
  record: {} as Record<string, AccountSignRecord>,
};

/**
 * A proxy object that will read and write the environment variables from the
 * script storage. The value will be the default value if the value is not set
 * in the script storage.
 */
export const values = new Proxy(
  environmentVariables as Record<number | string | symbol, unknown>,
  {
    get(target, key) {
      const value = GM_getValue(key.toString(), target[key]);

      if (typeof value === "object" && value !== null) {
        return new Proxy(
          value,
          RecursiveProxyUtil.getOptions(
            values as unknown as Record<number | string | symbol, object>,
            key,
          ),
        );
      }

      return value;
    },
    set(_, name, value) {
      GM_setValue(name.toString(), value);

      return true;
    },
  },
) as typeof environmentVariables;

export function getRecord(): AccountSignRecord {
  const record = values.record[BAHAID];
  const defaultValue = {
    updatedAt: TODAY.full,
  };

  if (!record) {
    values.record[BAHAID] = defaultValue;

    return values.record[BAHAID];
  }

  if (record.updatedAt !== TODAY.full) {
    values.record[BAHAID] = defaultValue;

    return values.record[BAHAID];
  }

  return record;
}
