/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable max-classes-per-file */
import fs from "fs";
import http, { type RequestListener } from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ACTUAL_FILE_DIR_PATH = path.join(__dirname, "..", "dist");
const ACTUAL_FILE_PATH = path.join(ACTUAL_FILE_DIR_PATH, "bundle.user.js");

const debug = Boolean(process.env.DEBUG);

/**
 * The default UUID that will be used for the script name.
 */
const initialUUID = process.env.UUID ?? "12345678-1234-1234-123456789012";

const cacheFolder = path.join(__dirname, "..", ".cache");
const cacheFilePath = path.join(cacheFolder, "uuid-cache.json");

function saveCache(self: string, all: string[]) {
  if (!fs.existsSync(cacheFolder))
    fs.mkdirSync(cacheFolder, { recursive: true });
  const cachePath = path.join(cacheFilePath);
  const cacheContent = JSON.stringify({ all, self });

  fs.writeFileSync(cachePath, cacheContent);
}

function getCache() {
  if (!fs.existsSync(cacheFilePath)) return { all: [], self: initialUUID };
  if (!fs.existsSync(cacheFolder))
    fs.mkdirSync(cacheFolder, { recursive: true });
  const cachePath = path.join(cacheFilePath);
  const cacheContent = fs.readFileSync(cachePath);
  const cache = JSON.parse(cacheContent.toString()) as {
    all: string[];
    self: string;
  };

  return cache;
}

let {
  /**
   * The actual UUID that will be used for the script name. It will be auto
   * updated when the Tampermonkey sync the scripts in your browser to the server
   * by comparing the script name. Alternatively, you can manually set the UUID by
   * setting the `UUID` env.
   */
  self: UUID = initialUUID,
  /**
   * All installed scripts that reported by the Tampermonkey. If the WebDAV server
   * does not return script that user installed, it will try to upload the script
   * when sync. So we record the scripts when the server first received the
   * script.
   */
  // eslint-disable-next-line prefer-const
  all: allFileNames = [],
} = getCache();

function getScriptName() {
  const packageJsonPath = path.join(__dirname, "..", "package.json");
  const packageJsonContent = fs.readFileSync(packageJsonPath);
  const packageJson = JSON.parse(
    packageJsonContent.toString(),
    // eslint-disable-next-line @typescript-eslint/naming-convention
  ) as { name?: string; "user-script-meta": { name?: string } };
  const name = packageJson["user-script-meta"].name || packageJson.name;

  return name;
}

function getUUID() {
  return process.env.UUID ?? UUID;
}

/**
 * A helper class to generate XML string.
 */
// eslint-disable-next-line @typescript-eslint/no-namespace
namespace WebDavXML {
  export class Item {
    childs: (Item | string)[] = [];

    constructor(
      public name: string,
      content?: Item[] | string,
      public attributes: string[] = [],
    ) {
      if (typeof content === "string") {
        this.childs.push(content);
      }
      if (Array.isArray(content)) {
        this.childs.push(...content);
      }
    }

    addChild(child: Item) {
      this.childs.push(child);

      return this;
    }

    addChildren(...childs: Item[]) {
      this.childs.push(...childs);

      return this;
    }

    toString(): string {
      const attributes = (() => {
        if (this.attributes.length) return ` ${this.attributes.join(" ")}`;

        return "";
      })();
      const childs = this.childs.map(child => child.toString()).join("");

      if (!childs) {
        return `<d:${this.name}${attributes} />`;
      }

      return `<d:${this.name}${attributes}>${childs}</d:${this.name}>`;
    }
  }

  export class MultiStatusDocument extends Item {
    constructor() {
      super("multistatus", undefined, [
        'xmlns:d="DAV:"',
        'xmlns:td="http://dav.tampermonkey.net/ns"',
      ]);
    }

    toString(): string {
      return `<?xml version="1.0"?>${super.toString()}`;
    }
  }

  export class Collection extends Item {
    constructor(
      protected filePath: string,
      protected lastModified: string = new Date().toUTCString(),
    ) {
      super("response");
    }

    toString(): string {
      this.childs.push(
        new Item("href", this.filePath),
        new Item("propstat", [
          new Item("prop", [
            new Item("getlastmodified", this.lastModified),
            new Item("resourcetype", [new Item("collection")]),
            new Item("getcontentlength"),
          ]),
          new Item("status", "HTTP/1.1 200 OK"),
        ]),
      );

      return super.toString();
    }
  }

  export class File extends Item {
    constructor(
      protected filePath: string,
      protected lastModified: string = new Date().toUTCString(),
      protected fileSize: number | string = 0,
    ) {
      super("response");
    }

    toString(): string {
      this.childs.push(
        new Item("href", this.filePath),
        new Item("propstat", [
          new Item("prop", [
            new Item("getlastmodified", this.lastModified),
            new Item("resourcetype"),
            new Item("getcontentlength", this.fileSize.toString()),
          ]),
          new Item("status", "HTTP/1.1 200 OK"),
        ]),
      );

      return super.toString();
    }
  }
}

/**
 * A helper function to receive the request body.
 */
function receiveBody(request: http.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    request.on("data", (chunk: Buffer) => chunks.push(chunk));
    request.on("end", () => {
      resolve(Buffer.concat(chunks).toString());
    });

    request.on("error", reject);
  });
}

function getMetaContent() {
  const content = {
    lastModified: Date.now().toString(),
    name: getScriptName(),
    options: {},
    uuid: UUID,
  };

  return JSON.stringify(content);
}

function getActualFileContent() {
  const content = fs.readFileSync(ACTUAL_FILE_PATH);

  return content;
}

/**
 * This Proxy will return an object with key-value pair that the key is the
 * script file name and the value is a function which will returns expected file
 * content.
 *
 * This is used to fake the file structure to reduce the complexity of implement
 * a WebDAV server.
 *
 * @returns {Record<string, Function>} return an object that the key is the file
 * name and the value is a function which will returns expected file content.
 */
const fakeFiles = new Proxy(
  {
    [`${initialUUID}.meta.json`]: getMetaContent,
    [`${initialUUID}.user.js`]: getActualFileContent,
  },
  {
    get(target, name) {
      const actualUUID = getUUID();

      if (name === `${actualUUID}.meta.json`) {
        return target[`${initialUUID}.meta.json`];
      }
      if (name === `${actualUUID}.user.js`) {
        return target[`${initialUUID}.user.js`];
      }

      return "";
    },
    getOwnPropertyDescriptor() {
      return {
        configurable: true,
        enumerable: true,
      };
    },
    ownKeys() {
      const actualUUID = getUUID();

      return [
        `${actualUUID}.meta.json`,
        `${actualUUID}.user.js`,
        ...allFileNames.filter(name => !name.includes(actualUUID)),
      ];
    },
  },
);

/**
 * This is the base structure of the fake file system.
 */
const fakeFileStructure = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Tampermonkey: {
    sync: fakeFiles,
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  "bundle.user.js": getActualFileContent,
};

/**
 * The methods that the WebDAV server will handle.
 *
 * @returns {Record<string, Function>} return an object that the key is the
 * method and the value is the handler function.
 */
const methods: Record<
  string,
  (
    uri: URL,
    ...params: Parameters<RequestListener>
  ) => ReturnType<RequestListener>
> = {
  get(uri, request, response) {
    const filePathParts = path.resolve(uri.pathname).slice(1).split(path.sep);

    const handler = filePathParts.reduce<unknown>(
      (prev, curr) =>
        (prev as Record<string, () => string> | undefined)?.[
          curr as keyof typeof prev
        ],
      fakeFileStructure,
    ) as (() => string) | undefined;

    if (!handler || typeof handler !== "function") {
      response.statusCode = 404;

      return response.end("404 Not Found");
    }

    const content = handler();

    response.statusCode = 200;
    response.setHeader("Content-Type", "application/octet-stream");
    if (debug) console.debug("got(200): ", content);

    return response.end(content);
  },
  propfind(uri, request, response) {
    const resolvedPath = path.resolve(uri.pathname);
    const filePathParts = [
      "fakeFileStructure",
      ...resolvedPath.slice(1).split(path.sep).filter(Boolean),
    ];

    const handler = filePathParts.reduce<unknown>(
      (prev, curr) =>
        (prev as Record<string, () => string> | undefined)?.[
          curr as keyof typeof prev
        ],
      { fakeFileStructure },
    ) as (() => string) | undefined;

    if (debug) console.debug("propfind: ", uri.pathname);

    if (!handler) {
      response.statusCode = 404;

      return response.end("404 Not Found");
    }

    const responseDocument = new WebDavXML.MultiStatusDocument();
    const currentItem = new WebDavXML.Collection(resolvedPath);

    responseDocument.addChild(currentItem);

    if (typeof handler === "object") {
      const files = Object.keys(handler);

      if (debug) console.debug("files: ", files);
      const fileItems = files.map(
        file => new WebDavXML.File(path.join(uri.pathname, file)),
      );

      responseDocument.addChildren(...fileItems);
    }

    response.statusCode = 207;
    response.setHeader("Content-Type", "application/xml; charset=utf-8");
    const responseString = responseDocument.toString();

    if (debug) console.debug("propfind(207): ", responseString);

    return response.end(responseString);
  },
  async put(uri, request, response) {
    const fileName = path.basename(uri.pathname);

    if (!allFileNames.includes(fileName)) allFileNames.push(fileName);

    if (!uri.pathname.endsWith(".meta.json")) {
      response.statusCode = 200;

      return response.end();
    }

    const body = await receiveBody(request);
    const parsedBody = JSON.parse(body) as {
      lastModified: string;
      name: string;
      options: Record<string, unknown>;
      uuid: string;
    };

    if (debug) console.debug("received meta:", parsedBody);

    if (parsedBody.name === getScriptName()) {
      if (parsedBody.uuid !== UUID) {
        UUID = parsedBody.uuid;
        console.info(`UUID updated to ${UUID}`);
      }
    }
    saveCache(UUID, allFileNames);
    response.statusCode = 200;

    return response.end();
  },
};

/**
 * The request handler for the WebDAV server.
 *
 * @param request Standard request object
 * @param response Standard response object
 */
// eslint-disable-next-line func-style
const requestHandler: RequestListener = function requestHandler(
  request,
  response,
) {
  request.on("error", (error: Error) => {
    console.error(error, request);
  });

  const uri = new URL(`http://${request.headers.host}${request.url}`);
  const method =
    uri.searchParams.get("method") || request.method?.toLowerCase();

  if (debug)
    console.debug(`${method}: `, uri.pathname, uri.search, request.headers);

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!method || !methods[method]) {
    if (debug) console.debug(`Unimplemented: ${method}`);
    response.statusCode = 501;

    response.end("501 Unimplemented");

    return;
  }

  const handler = methods[method];

  response.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, post-check=0, pre-check=0",
  );

  response.setHeader("DAV", "1");

  handler(uri, request, response);
};

const server = http.createServer(requestHandler);
const host = process.env.HOST || "0.0.0.0";
const port = Number(process.env.PORT || 9000);

server.listen(port, host, undefined, () => {
  console.info(`WebDAV server is listening on http://${host}:${port}`);
  console.info(
    `You can install current script from: http://${host}:${port}/bundle.user.js`,
  );
});

process.once("SIGHUP", () => server.close());
