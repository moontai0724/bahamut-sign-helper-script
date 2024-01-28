import { RecursiveProxyUtil } from "utils";

import { BAHAID, TODAY } from "./constants";

export interface AccountSignRecord {
  /**
   * Whether the account has answered the quiz today.
   */
  animadQuizAnswered?: boolean;
  /**
   * Whether the account has signed daily sign today.
   */
  dailySigned?: boolean;
  /**
   * The guilds that the account has signed today.
   */
  signedGuilds?: number[];
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
  config: {
    animad: {
      quiz: {
        /**
         * Whether to answer the quiz automatically.
         * @default true
         */
        autoAnswer: true,
        /**
         * The grace time of the quiz, calculated in milliseconds from the
         * start of the day. The manual answer will not be triggered
         * if the time is not reached.
         */
        graceTime: 0,
        /**
         * Whether to use the source of the quiz.
         */
        source: {
          /**
           * Fetch answer from daily post of user `blackxblue`.
           * @see https://home.gamer.com.tw/blackxblue
           *
           * @default true
           */
          blackxblue: true,
          /**
           * Fetch answer from unofficial gamer quiz collection.
           * Since this approach is not stable, and is slow, this is only
           * be used as a fallback.
           *
           * @see https://home.gamer.com.tw/creationDetail.php?sn=3924920
           *
           * @default true
           */
          collection: true,
        },
      },
    },
  },
  enable: {
    /**
     * Whether to enable the answer animad quiz feature.
     */
    animadQuiz: true,
    /**
     * Whether to enable the daily sign feature.
     * @default true
     */
    dailySign: true,
    /**
     * Whether to enable the guild sign feature.
     * @default true
     */
    guildSign: true,
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

  if (!record || record.updatedAt !== TODAY.full) {
    values.record[BAHAID] = defaultValue;

    return values.record[BAHAID];
  }

  return record;
}
