/**
 * Stores the environment variables here, the value will be the default value if
 * the value is not set in the script storage.
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
const environment = new Proxy(environmentVariables as Record<string, unknown>, {
  get(target, name) {
    const value = GM_getValue(name.toString(), target[name.toString()]);

    return value;
  },
  set(target, name, value) {
    GM_setValue(name.toString(), value);

    return true;
  },
});

export default environment as typeof environmentVariables;
