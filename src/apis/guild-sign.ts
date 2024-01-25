import { HttpService } from "services";

interface GuildInfo {
  ES_score: number;
  background: string;
  balaNum: number;
  balaYesterdayNum: number;
  checkCount: number;
  isAgeLimit: boolean;
  isCadre: boolean;
  isCreator: boolean;
  isMember: boolean;
  isPassContentLimit: boolean;
  isR18: boolean;
  isUnChecked: boolean;
  joinType: number;
  /**
   * @example "2021-01-25 00:13:53"
   */
  lastContributeTime: string;
  memberNum: number;
  order: number;
  /**
   * Guild cover photo url.
   * @example "https://p2.bahamut.com.tw/B/GUILD/c/2/0000006292.PNG"
   */
  pic: string;
  privateType: number;
  pv: number;
  rank: number;
  /**
   * Guild short description, will truncate if too long.
   * @example "歡迎各位來到 Jubeat 精華組公會目前本板不特別招募精華組員，但如有意參"
   */
  shortIntro: string;
  /**
   * Guild id (serial number)
   * @example 6292
   */
  sn: number;
  tags: string[];
  /**
   * Guild title
   * @example "jubeat 精華組"
   */
  title: string;
}

export async function getMyGuilds() {
  const uri = "https://api.gamer.com.tw/guild/v2/guild_my.php";
  const response = await HttpService.get<{ data: { list: GuildInfo[] } }>(uri, {
    anonymous: false,
    // cookie: `ckBahamutCsrfToken=${token}`,
    // data: params as unknown as string,
    // headers: {
    //   [HeaderOption.XBahamutCsrfToken]: token,
    // },
    responseType: "json",
  });

  return response.data.list;
}

interface ApiErrorResult {
  error: 1;
  /**
   * @example "您今天已經簽到過了！"
   */
  msg: string;
}

interface ApiSignResult {}

export async function sign(id: string | number) {
  const uri = "https://guild.gamer.com.tw/ajax/guildSign.php";
  const data = new URLSearchParams();

  data.set("sn", id.toString());

  const response = await HttpService.post<ApiSignResult | ApiErrorResult>(uri, {
    anonymous: false,
    data: data as unknown as string,
    responseType: "json",
  });

  if ("error" in response) return Promise.reject(response);

  return response;
}
