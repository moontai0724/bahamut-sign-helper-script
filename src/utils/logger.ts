const { info: originalInfo, error: originalError, ...remains } = console;

const prefix = `[bahamut-sign-helper-script]`;

export function info(...params: Parameters<typeof originalInfo>) {
  return originalInfo(prefix, ...params);
}

export function error(...params: Parameters<typeof originalError>) {
  return originalError(prefix, ...params);
}

export default { error, info, ...remains };
