import vue from "@vitejs/plugin-vue";
import { readdirSync } from "fs";
import { resolve } from "path";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

const alias = readdirSync(resolve(__dirname, "views")).reduce((acc, value) => {
  acc[value] = resolve(__dirname, `views/${value}`);

  return acc;
}, {});

const pages = readdirSync(resolve(__dirname, "views/pages")).reduce(
  (acc, name) => {
    acc[name] = resolve(__dirname, `views/pages/${name}/index.html`);

    return acc;
  },
  {},
);

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      input: pages,
    },
  },
  plugins: [vue(), viteSingleFile({ removeViteModuleLoader: true })],
  publicDir: false,
  resolve: {
    alias,
  },
  root: "views",
});
