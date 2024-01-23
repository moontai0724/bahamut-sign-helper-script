export type RequestMethod = "GET" | "HEAD" | "POST";

export enum HeaderOption {
  ContentType = "Content-Type",
  XBahamutCsrfToken = "x-bahamut-csrf-token",
}

export enum ContentType {
  FormData = "multipart/form-data",
  FormUrlEncoded = "application/x-www-form-urlencoded",
}

/**
 * Send an HTTP request by using `GM_xmlhttpRequest`.
 *
 * @param method HTTP method, only GET, HEAD and POST are supported.
 * @param url Target URL.
 * @param options Options for `GM_xmlhttpRequest`.
 *
 * @returns A promise that wrap resolves to the response.
 */
export async function request<Response = unknown>(
  method: RequestMethod,
  url: string,
  options: Omit<
    Tampermonkey.Request,
    "method" | "onerror" | "onload" | "ontimeout" | "url"
  >,
): Promise<Response> {
  return new Promise((resolve, reject) => {
    const basicOptions: Tampermonkey.Request = {
      method,
      onerror: reject,
      onload: httpResponse => {
        resolve(httpResponse.response as Response);
      },
      ontimeout: reject,
      url,
    };

    Object.assign(basicOptions, options);
    GM_xmlhttpRequest(basicOptions);
  });
}

/**
 * Send an HTTP GET request by using `GM_xmlhttpRequest`.
 *
 * @param url Target URL.
 * @param options Options for `GM_xmlhttpRequest`.
 */
export async function get<Response>(
  url: string,
  options: Omit<
    Tampermonkey.Request,
    "method" | "onerror" | "onload" | "ontimeout" | "url"
  > = {},
): Promise<Response> {
  return request<Response>("GET", url, options);
}

/**
 * Send an HTTP POST request by using `GM_xmlhttpRequest`.
 *
 * @param url Target URL.
 * @param options Options for `GM_xmlhttpRequest`.
 */
export async function post<Response>(
  url: string,
  options: Omit<
    Tampermonkey.Request,
    "method" | "onerror" | "onload" | "ontimeout" | "url"
  > = {},
): Promise<Response> {
  return request<Response>("POST", url, options);
}
