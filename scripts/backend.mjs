import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const localGo = fileURLToPath(
  new URL("../.tools/go/bin/go.exe", import.meta.url),
);
const executable =
  process.platform === "win32" && existsSync(localGo) ? localGo : "go";
const child = spawn(executable, process.argv.slice(2), {
  cwd: fileURLToPath(new URL("../backend/", import.meta.url)),
  stdio: "inherit",
});
child.on("error", (error) => {
  console.error(`Go could not start: ${error.message}`);
  process.exitCode = 1;
});
child.on("exit", (code) => {
  process.exitCode = code ?? 1;
});
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => child.kill(signal));
