import { CsrfTokenService, HttpService } from "services";
import { HeaderOption } from "services/http";

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
 * This is the api that the current landing page uses.
 */
async function check(): Promise<ApiDailySignCheckResult> {
  const token = CsrfTokenService.getCSRFToken();

  const params = new FormData();

  params.append("action", "2");

  const response = await HttpService.post<{ data: ApiDailySignCheckResult }>(
    "https://api.gamer.com.tw/user/v1/signin.php",
    {
      anonymous: false,
      cookie: `ckBahamutCsrfToken=${token}`,
      data: params as unknown as string,
      headers: {
        [HeaderOption.XBahamutCsrfToken]: token,
      },
      responseType: "json",
    },
  );

  if ("error" in response) return Promise.reject(response.error);

  return response.data;
}

interface ApiSignResult {
  btnMessage: string;
  days: number;
  dialog: string;
  dialogInfo: [];
  prjSigninDays: number;
  totalWeeks: number;
}

/**
 * This is the api that the current landing page uses.
 * @example {
    "days": 111,
    "dialog": "",
    "prjSigninDays": 0,
    "btnMessage": "<i class=\"material-icons\">check_box</i>每日簽到已達成",
    "totalWeeks": 4,
    "dialogInfo": []
  }
 */
async function sign(): Promise<ApiSignResult> {
  const token = CsrfTokenService.getCSRFToken();

  const params = new FormData();

  params.append("action", "1");

  const response = await HttpService.post<{ data: ApiSignResult }>(
    "https://api.gamer.com.tw/user/v1/signin.php",
    {
      anonymous: false,
      cookie: `ckBahamutCsrfToken=${token}`,
      data: params as unknown as string,
      headers: {
        [HeaderOption.XBahamutCsrfToken]: token,
      },
      responseType: "json",
    },
  );

  if ("error" in response) return Promise.reject(response.error);

  return response.data;
}

const dailySignApi = { check, sign };

export default dailySignApi;
