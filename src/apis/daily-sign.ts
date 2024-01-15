import { getCSRFToken } from "../utils/csrf-token";
import httpRequest, { ContentType, HeaderOption } from "../utils/http-request";

export interface DailySignCheckResult {
  /**
   * Current continuous sign-in days, will be reset to 0 if not signed in today
   * or not logged in.
   */
  days: number;
  finishedAd: number;
  prjSigninDays: number;
  /**
   * 0: not signed
   * 1: signed
   */
  signin: number;
}

export interface ApiDailySignCheckResult {
  btnMessage: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  close_auto: number;
  days: number;
  dialogInfo: string[];
  finishedAd: number;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  open_auto_ani: number;
  prjSigninDays: number;
  signin: number;
  totalWeeks: number;
}

/**
 * This is the old API for daily sign.
 */
async function check(): Promise<DailySignCheckResult> {
  const params = new URLSearchParams();

  params.append("action", "2");

  const response = await httpRequest.post<{ data: DailySignCheckResult }>(
    "https://www.gamer.com.tw/ajax/signin.php",
    {
      anonymous: false,
      data: params as unknown as string,
      responseType: "json",
    },
  );

  if ("error" in response) return Promise.reject(response.error);

  return response.data;
}

/**
 * This is the api that the current landing page uses.
 */
async function checkApi(): Promise<ApiDailySignCheckResult> {
  const token = getCSRFToken();

  const params = new FormData();

  params.append("action", "2");

  const response = await httpRequest.post<{ data: ApiDailySignCheckResult }>(
    "https://api.gamer.com.tw/user/v1/signin.php",
    {
      anonymous: false,
      cookie: `ckBahamutCsrfToken=${token}`,
      data: params as unknown as string,
      headers: {
        [HeaderOption.csrfToken]: token,
      },
      responseType: "json",
    },
  );

  if ("error" in response) return Promise.reject(response.error);

  return response.data;
}

interface SignResult {
  days: number;
  dialog: string;
  prjSigninDays: number;
}

/**
 * 送出每日簽到
 * @returns signed: {"code": 0, "message": "今天您已經簽到過了喔"}
 * @returns not signed: { "data": { "days": 83, "dialog": "", "prjSigninDays": 0 }}
 * @returns not logged in: {code: 401, message: "尚未登入", status: "NO_LOGIN", details: []}
 */
async function sign(): Promise<SignResult> {
  const token = await httpRequest.get<string>(
    "https://www.gamer.com.tw/ajax/get_csrf_token.php",
  );

  const params = new URLSearchParams();

  params.append("action", "1");
  params.append("token", token);

  const result = await httpRequest.post<{ data: SignResult }>(
    "https://www.gamer.com.tw/ajax/signin.php",
    {
      anonymous: false,
      data: params as unknown as string,
      headers: {
        [HeaderOption.contentType]: ContentType.formUrlEncoded,
      },
      responseType: "json",
    },
  );

  if ("error" in result) return Promise.reject(result.error);

  return result.data;
}

/**
 * This is the api that the current landing page uses.
 */
async function signApi(): Promise<ApiDailySignCheckResult> {
  const token = getCSRFToken();

  const params = new FormData();

  params.append("action", "1");

  const response = await httpRequest.post<{ data: ApiDailySignCheckResult }>(
    "https://api.gamer.com.tw/user/v1/signin.php",
    {
      anonymous: false,
      cookie: `ckBahamutCsrfToken=${token}`,
      data: params as unknown as string,
      headers: {
        [HeaderOption.csrfToken]: token,
      },
      responseType: "json",
    },
  );

  if ("error" in response) return Promise.reject(response.error);

  return response.data;
}

const dailySign = { check, checkApi, sign, signApi };

export default dailySign;
