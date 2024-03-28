import typescript from "@rollup/plugin-typescript";
import vue from "@vitejs/plugin-vue";
import { readdirSync } from "fs";
import { resolve } from "path";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

const root = resolve(__dirname, "src/views");

const alias = readdirSync(root).reduce(
  (acc, value) => {
    acc[value] = resolve(root, value);

    return acc;
  },
  {
    "@common": resolve(__dirname, "src/common"),
  },
);

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    emptyOutDir: true,
    outDir: resolve(__dirname, "dist"),
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
