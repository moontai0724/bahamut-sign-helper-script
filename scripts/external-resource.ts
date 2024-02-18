/* eslint-disable import/no-extraneous-dependencies */
import { createFilter } from "@rollup/pluginutils";
import htmlMinifier, {
  type Options as HtmlMinifierOptions,
} from "html-minifier";
import Path from "path";

export const resources = new Map();

interface PluginOptions {
  exclude?: string;
  htmlMinifierOptions?: HtmlMinifierOptions;
  include?: string;
  /**
   * Whether to use external resource.
   */
  production?: boolean;
}

function getExternalTransformMethod(options: PluginOptions) {
  const include = options.include || "**/*.ts";
  const filter = createFilter(include, options.exclude);

  function transform(
    sourceCode: string,
    importPath: string,
  ): { code: string; map: { mappings: string } } | void {
    if (filter(importPath)) return;

    const resource = (() => {
      const relativePath = Path.relative(
        Path.join(__dirname, "dist"),
        importPath,
      );
      const existing = resources.get(relativePath);

      if (existing) return existing;

      const random = Math.random().toString(36).substring(7);
      const name = `resource_${random}`;

      resources.set(relativePath, name);

      return name;
    })();

    const code = `export default GM_getResourceText("${resource}");`;

    // eslint-disable-next-line consistent-return
    return {
      code,
      map: { mappings: "" },
    };
  }

  return transform;
}

function getInlineTransformMethod(options: PluginOptions) {
  const include = options.include || "**/*.ts";
  const filter = createFilter(include, options.exclude);

  function transform(
    sourceCode: string,
    importId: string,
  ): { code: string; map: { mappings: string } } | void {
    if (filter(importId)) return;

    const minified = JSON.stringify(
      htmlMinifier.minify(sourceCode, options.htmlMinifierOptions),
    );

    const code = `export default ${minified};`;

    // eslint-disable-next-line consistent-return
    return {
      code,
      map: { mappings: "" },
    };
  }

  return transform;
}

function initPlugin(options: PluginOptions) {
  const baseOptions = {
    name: "external-resource",
  };
  const { production } = options;

  if (!production) {
    Object.assign(baseOptions, {
      transform: getInlineTransformMethod(options),
    });
  } else {
    Object.assign(baseOptions, {
      transform: getExternalTransformMethod(options),
    });
  }

  return baseOptions;
}

interface ScriptCommentOptions {
  /**
   * Base URL of the GitHub repository where the user-script is hosted, used to
   * generate raw URL of resources.
   */
  baseUrl: string;
  /**
   * Path based on the root of the repository.
   */
  path?: string;
}

/**
 * Get resource mapping for user-script.
 *
 * @param param0 options when generating resource mapping.
 * @example resource_5jqnq8 https://github.com/moontai0724/bahamut-sign-helper-script/raw/pages/animad-manual-answer/index.html
 */
export function getResourceMapping({
  baseUrl,
  path = "/raw/release/",
}: ScriptCommentOptions) {
  if (!/^https:\/\/github.com\/\w+?\/\w+?/.test(baseUrl)) {
    throw new Error(`baseUrl must be a GitHub repository: ${baseUrl}`);
  }

  return Array.from(resources.entries()).map(([relativePath, resource]) => {
    const result = `${baseUrl}${path}${relativePath}`;

    console.log(`Resource: ${resource} -> ${result}`);

    return `${resource} ${result}`;
  });
}

/**
 * Replace imports by using `@resource` of user-script.
 *
 * @see https://www.tampermonkey.net/documentation.php#meta:resource
 */
export default function externalResource(options: PluginOptions = {}) {
  return initPlugin(options);
}
