import { ipcMain, app, BrowserWindow } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { spawn } from "child_process";
const containerName = "devlocalhost.php-api";
function tinkerCommandEvent() {
  ipcMain.handle("execute-tinker-command", async (_event, command) => {
    return new Promise((resolve) => {
      command = command.replace(/^\s*<\?php\s*/, "").trim();
      const phpCommand = `
            DB::enableQueryLog();
            $result = ${command};
            $queries = DB::getQueryLog();
            echo json_encode(['result' => $result, 'queries' => $queries], JSON_PRETTY_PRINT);
          `;
      const tinkerProcess = spawn("docker", [
        "exec",
        "-i",
        containerName,
        "php",
        "artisan",
        "tinker",
        "--env=nilopoliseduca.dev"
      ]);
      let output = "";
      tinkerProcess.stdout.on("data", (data) => {
        output += data.toString();
      });
      tinkerProcess.on("close", () => {
        resolve(output);
      });
      tinkerProcess.stdin.write(`${phpCommand}
`);
      tinkerProcess.stdin.end();
    });
  });
}
function registerAllEvents() {
  tinkerCommandEvent();
}
const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs")
    }
  });
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app.whenReady().then(() => {
  createWindow();
  registerAllEvents();
});
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
