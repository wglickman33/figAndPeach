import { spawn } from "node:child_process";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

const VITE_PORT = 5199;
const NETLIFY_PORT = 8888;
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function waitForPort(port, timeoutMs = 60_000) {
  const host = "127.0.0.1";
  const started = Date.now();

  return new Promise((resolve, reject) => {
    const attempt = () => {
      const socket = net.connect({ port, host }, () => {
        socket.end();
        resolve();
      });
      socket.on("error", () => {
        socket.destroy();
        if (Date.now() - started > timeoutMs) {
          reject(
            new Error(
              `Vite did not start on http://${host}:${port} within ${timeoutMs / 1000}s`,
            ),
          );
          return;
        }
        setTimeout(attempt, 200);
      });
    };
    attempt();
  });
}

function portAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", () => resolve(false));
    server.once("listening", () => {
      server.close(() => resolve(true));
    });
    server.listen(port, "127.0.0.1");
  });
}

function run(command, args) {
  return spawn(command, args, {
    cwd: root,
    stdio: "inherit",
    env: process.env,
  });
}

let shuttingDown = false;
let vite;
let netlify;

function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  netlify?.kill("SIGTERM");
  vite?.kill("SIGTERM");
  setTimeout(() => process.exit(code), 300);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

const available = await portAvailable(VITE_PORT);
if (!available) {
  console.error(
    `\nPort ${VITE_PORT} is already in use. Stop the other process (often a leftover \`npm run dev\`) and try again.\n`,
  );
  process.exit(1);
}

vite = run("npm", ["run", "dev:vite"]);
vite.on("exit", (code, signal) => {
  if (shuttingDown) return;
  if (signal) shutdown(1);
  else shutdown(code ?? 1);
});

try {
  await waitForPort(VITE_PORT);
} catch (err) {
  console.error(err.message);
  shutdown(1);
  process.exit(1);
}

netlify = run("npx", [
  "netlify",
  "dev",
  "--offline",
  "--framework",
  "#custom",
  "--command",
  "node scripts/dev-netlify-hold.mjs",
  "--target-port",
  String(VITE_PORT),
  "--port",
  String(NETLIFY_PORT),
]);

netlify.on("exit", (code) => {
  if (shuttingDown) return;
  shutdown(code ?? 0);
});
