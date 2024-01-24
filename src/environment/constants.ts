export const TODAY = (() => {
  const fullDate = new Date().toLocaleDateString("zh-TW", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Taipei",
    year: "numeric",
  });
  const [currentYear, currentMonth, currentDate] = fullDate.split("/");
  const startOfTodayTimeString = `${currentYear}-${currentMonth}-${currentDate}T00:00:00+0800`;

  return {
    /**
     * The date of today.
     * @example 9
     */
    date: parseInt(currentDate, 10),
    /**
     * The full date of today.
     * @example "2024/03/09"
     */
    full: fullDate,
    /**
     * The month of today.
     * @example 3
     */
    month: parseInt(currentMonth, 10),
    /**
     * The start time of today.
     * @example new Date("2024-03-09T00:00:00+0800")
     */
    start: new Date(startOfTodayTimeString),
    /**
     * The year of today.
     * @example 2024
     */
    year: parseInt(currentYear, 10),
  };
})();

export const BAHAID = (() => {
  const account = /BAHAID=(?<BAHAID>.+?);/u.exec(document.cookie)?.[1];

  if (!account) {
    // directly break the script execution if the account is not found.
    throw new Error("BAHAID is not found in cookie.");
  }

  return account;
})();
