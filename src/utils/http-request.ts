export type RequestMethod = "GET" | "HEAD" | "POST";

export enum HeaderOption {
  contentType = "Content-Type",
  csrfToken = "x-bahamut-csrf-token",
}

export enum ContentType {
  formData = "multipart/form-data",
  formUrlEncoded = "application/x-www-form-urlencoded",
}

async function request<Response>(
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
    console.log(basicOptions);
    GM_xmlhttpRequest(basicOptions);
  });
}

async function get<Response>(
  url: string,
  options: Omit<
    Tampermonkey.Request,
    "method" | "onerror" | "onload" | "ontimeout" | "url"
  > = {},
): Promise<Response> {
  return request<Response>("GET", url, options);
}

async function post<Response>(
  url: string,
  options: Omit<
    Tampermonkey.Request,
    "method" | "onerror" | "onload" | "ontimeout" | "url"
  > = {},
): Promise<Response> {
  return request<Response>("POST", url, options);
}

export default { get, post, request };
