import typescript from "@rollup/plugin-typescript";
import vue from "@vitejs/plugin-vue";
import { readdirSync } from "fs";
import { resolve } from "path";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

const root = "src/views";

const alias = readdirSync(resolve(__dirname, root)).reduce((acc, value) => {
  acc[value] = resolve(__dirname, `${root}/${value}`);

  return acc;
}, {});

const pages = readdirSync(resolve(__dirname, `${root}/pages`)).reduce(
  (acc, name) => {
    acc[name] = resolve(__dirname, `${root}/pages/${name}/index.html`);

    return acc;
  },
  {},
);

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: resolve(__dirname, "dist"),
    rollupOptions: {
      input: pages,
    },
  },
  plugins: [
    vue(),
    viteSingleFile({ removeViteModuleLoader: true }),
    typescript({
      tsconfig: `${root}/tsconfig.json`,
    }),
  ],
  publicDir: false,
  resolve: {
    alias,
  },
  root,
});
