import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const commands = [
  [process.execPath, ["scripts/backend.mjs", "fmt", "./..."]],
  [process.execPath, ["scripts/backend.mjs", "vet", "./..."]],
  [
    process.execPath,
    ["scripts/backend.mjs", "test", "./...", "-coverprofile=coverage.out"],
  ],
  [
    process.execPath,
    ["scripts/backend.mjs", "tool", "cover", "-func=coverage.out"],
  ],
  [npm, ["run", "spec:validate"]],
  [npm, ["run", "verify:frontend"]],
];
for (const [executable, args] of commands) {
  console.log(`\n> ${executable} ${args.join(" ")}`);
  const result = spawnSync(executable, args, {
    cwd: root,
    stdio: "inherit",
    shell: process.platform === "win32" && executable === npm,
  });
  if (result.error) console.error(result.error.message);
  if (result.status !== 0) process.exit(result.status ?? 1);
}
