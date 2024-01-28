import { HttpService } from "services";

export interface CreationInfo {
  bahacoin: string;
  /**
   * The category title of the creation.
   */
  categoryName: string;
  /**
   * The trimmed content of the creation.
   */
  content: string;
  /**
   * The cover picture image url of the creation.
   */
  coverpic: string;
  /**
   * The cover picture image url set of the creation.
   */
  coverpicsrcset: string;
  /**
   * The creation post id.
   */
  csn: string;
  /**
   * The creation post date.
   * @example "2 小時前"
   * @example "01-19 00:00"
   */
  ctime: string;
  donatable: number;
  donateCount: number;
  donateMoney: number;
  donateOpen: number;
  flag: string;
  flagMore: string;
  flagicon: [];
  gp: number;
  kind1: string;
  kind1icon: string;
  /**
   * User nickname of the creation author.
   */
  nick: string;
  showAdult: true;
  /**
   * The title of the creation.
   */
  title: string;
  /**
   * User account of the creation author.
   */
  userid: string;
  visit: number;
}

interface CreationListResponse {
  data: {
    /**
     * The list of creations.
     */
    list: CreationInfo[];
    /**
     * The total number of creations.
     */
    total: number;
    /**
     * The total number of pages.
     */
    totalPage: number;
  };
}

interface ListOptions {
  kind1?: string;
  page?: string;
  row?: string;
}

export async function list(user: string, options: ListOptions = {}) {
  const uri = "https://api.gamer.com.tw/home/v2/creation_list.php";
  const params = new URLSearchParams({
    owner: user,
    ...options,
  });
  const response = await HttpService.get<CreationListResponse>(
    `${uri}?${params.toString()}`,
    { responseType: "json" },
  );

  return response.data.list;
}

export async function getHTML(sn: string) {
  const uri =
    "https://api.gamer.com.tw/mobile_app/bahamut/v1/home_creation_detail_webview.php";
  const params = new URLSearchParams({ sn });
  const response = await HttpService.get<string>(`${uri}?${params.toString()}`);

  return response;
}
