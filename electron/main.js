const { app, BrowserWindow } = require("electron");
const path = require("path");
const http = require("http");
const { spawn } = require("child_process");

const PORT = process.env.PORT || 3210;
const isDev = !app.isPackaged && process.env.ELECTRON_DEV === "1";

let mainWindow;
let serverProcess;

function getServerPath() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, "standalone", "server.js");
  }
  return path.join(app.getAppPath(), ".next", "standalone", "server.js");
}

function startServer() {
  if (isDev) return; // next dev server is started separately by npm run electron:dev

  serverProcess = spawn(process.execPath, [getServerPath()], {
    env: {
      ...process.env,
      PORT: String(PORT),
      HOSTNAME: "127.0.0.1",
      NODE_ENV: "production",
      ELECTRON_RUN_AS_NODE: "1",
    },
    stdio: "ignore",
  });
}

function waitForServer(url, callback) {
  const attempt = () => {
    http
      .get(url, () => callback())
      .on("error", () => setTimeout(attempt, 300));
  };
  attempt();
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 640,
    autoHideMenuBar: true,
    backgroundColor: "#0a0a0a",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const url = isDev ? "http://localhost:3000" : `http://127.0.0.1:${PORT}`;
  waitForServer(url, () => mainWindow.loadURL(url));

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  startServer();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (serverProcess) serverProcess.kill();
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => {
  if (serverProcess) serverProcess.kill();
});
