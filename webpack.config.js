const meta = require("./package.json");
const path = require("path");
const Webpack = require("webpack");

module.exports = {
  mode: "production",
  entry: "./src/index.ts",
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: [/node_modules/],
      },
      {
        test: /\.html$/i,
        loader: "html-loader",
        options: {
          esModule: true,
        },
      },
      {
        test: /\.inline\.ts$/i,
        type: "asset/inline",
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    modules: [path.join(__dirname, "src"), "node_modules"],
  },
  output: {
    filename: "bundle.user.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
  optimization: {
    minimize: false,
  },
  plugins: [
    new Webpack.BannerPlugin({
      banner: () => {
        const scriptMeta = meta["user-script-meta"];

        scriptMeta.version = meta.version;
        if (!scriptMeta.name && meta.name) scriptMeta.name = meta.name;
        if (!scriptMeta.namespace && meta.homepage)
          scriptMeta.namespace = meta.homepage;
        if (!scriptMeta.description && meta.description)
          scriptMeta.description = meta.description;
        if (!scriptMeta.author && (meta.author?.name || meta.author))
          scriptMeta.author = meta.author?.name || meta.author;
        if (!scriptMeta.homepage && meta.homepage)
          scriptMeta.homepage = meta.homepage;
        if (!scriptMeta.supportURL && (meta.bugs?.url || meta.homepage))
          scriptMeta.supportURL = meta.bugs.url || meta.homepage;

        const metaString = Object.entries(scriptMeta)
          .map(([key, value]) => {
            function getMetaString(key, value) {
              return `// @${key.padEnd(15)} ${value}`;
            }

            if (Array.isArray(value)) {
              return value.map(v => getMetaString(key, v)).join("\n");
            }

            if (typeof value === "object") {
              return Object.entries(value)
                .map(([k, v]) => getMetaString(`${key}:${k}`, v))
                .join("\n");
            }

            return getMetaString(key, value);
          })
          .join("\n");

        return "// ==UserScript==\n" + metaString + "\n// ==/UserScript==\n";
      },
      raw: true,
    }),
  ],
};
