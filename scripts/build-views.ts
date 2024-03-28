import { resolve } from "path";
import { existsSync, readdirSync, rmdirSync } from "fs";
import { spawnSync } from "child_process";

const source = resolve("src/views/pages");
const dist = resolve("dist", "views");
if (existsSync(dist)) rmdirSync(dist, { recursive: true });

readdirSync(source, { withFileTypes: true }).forEach(item => {
  if (!item.isDirectory())
    console.debug("Skipped item not a directory:", item.name);

  console.log("Building", item.name);

  const filePath = resolve(source, item.name);
  const distPath = resolve(dist, item.name);

  const result = spawnSync(
    "pnpm",
    [
      ["vite", "build"],
      ["-c", "vite.config.ts"],
      ["--outDir", distPath],
      filePath,
    ].flat(),
    { stdio: "inherit" },
  );

  if (result.error) {
    console.error("Failed to build", item.name, result.error);
  } else {
    console.log("Successfully built", item.name);
  }
});
