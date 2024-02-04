/**
 * Generate a random hexadecimal string
 *
 * @param length The length of the hexadecimal string
 */
function generateRandomHex(length = 16): string {
  // Initialize an empty string to store the hexadecimal value
  let hexString = "";

  // Loop through the length of the hexadecimal string
  // eslint-disable-next-line no-plusplus
  for (let index = 0; index < length; index++) {
    // Generate a random hexadecimal digit (0-9, A-F)
    const randomDigit = Math.floor(Math.random() * 16).toString(16);

    // Append the random digit to the hexadecimal string
    hexString += randomDigit;
  }

  // Return the generated hexadecimal string
  return hexString;
}

/**
 * Get the CSRF token from `ckBahamutCsrfToken` cookie or generate a random one.
 *
 * @returns The CSRF token from cookie or a random 16-digit hexadecimal string
 */
export function getCSRFToken() {
  const existing = document.cookie
    .split(";")
    .find(value => value.trim().startsWith("ckBahamutCsrfToken"));

  if (!existing) return generateRandomHex();

  const [, ...fragments] = existing.split("=");
  const value = fragments.join("=");

  return value;
}
