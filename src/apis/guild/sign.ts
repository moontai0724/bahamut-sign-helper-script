import { HttpService } from "services";

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
