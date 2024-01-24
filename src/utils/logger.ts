const { info: originalInfo, error: originalError, ...remains } = console;

export function info(...params: Parameters<typeof originalInfo>) {
  return originalInfo("[bahamut-sign-helper]", ...params);
}

export function error(...params: Parameters<typeof originalError>) {
  return originalError("[bahamut-sign-helper]", ...params);
}

export default { error, info, ...remains };
