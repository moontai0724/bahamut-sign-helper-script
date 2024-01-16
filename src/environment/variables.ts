import { getRecursiveProxyOptions } from "../utils/recursive-proxy";

/**
 * Defines the environment variables here. The key of first level object will be
 * the identifier that stored into the script storage, and the value will be the
 * default value if the value is not set before.
 */
const environmentVariables = {
  /**
   * Whether to enable the daily sign feature.
   * @default true
   */
  doSignDaily: true,
};

/**
 * A proxy object that will read and write the environment variables from the
 * script storage. The value will be the default value if the value is not set
 * in the script storage.
 */
const environment = new Proxy(
  environmentVariables as Record<number | string | symbol, unknown>,
  {
    get(target, key) {
      const value = GM_getValue(key.toString(), target[key]);

      if (typeof value === "object" && value !== null) {
        return new Proxy(
          value,
          getRecursiveProxyOptions(
            environment as unknown as Record<number | string | symbol, object>,
            key,
          ),
        );
      }

      return value;
    },
    set(target, name, value) {
      GM_setValue(name.toString(), value);

      return true;
    },
  },
) as typeof environmentVariables;

export default environment;
