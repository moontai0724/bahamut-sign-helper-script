// Define a function to generate a random 16-digit hexadecimal string
function generateRandomHex() {
  // Set the length of the hexadecimal string
  const length = 16;
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

function getCSRFToken() {
  const existing = document.cookie
    .split(";")
    .find(value => value.trim().startsWith("ckBahamutCsrfToken"));

  if (!existing) return generateRandomHex();

  const [, ...fragments] = existing.split("=");
  const value = fragments.join("=");

  return value;
}

export { getCSRFToken };
