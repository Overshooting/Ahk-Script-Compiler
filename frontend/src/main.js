const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const fs = require("fs");

if (process.env.NODE_ENV !== "production") {
  require("electron-reload")(__dirname);
}

let currentScriptProcess = null;

ipcMain.handle("run-script", (event, scriptPath) => {
  // Stop any previous script
  if (currentScriptProcess) {
    currentScriptProcess.kill();
    currentScriptProcess = null;
  }

  // Spawn AHK process
  currentScriptProcess = spawn("autohotkey", [scriptPath]);

  currentScriptProcess.stdout.on("data", (data) => {
    event.sender.send("script-output", data.toString());
  });

  currentScriptProcess.stderr.on("data", (data) => {
    event.sender.send("script-output", `ERROR: ${data.toString()}`);
  });

  currentScriptProcess.on("close", (code) => {
    event.sender.send("script-output", `Script exited with code ${code}`);
    currentScriptProcess = null;
  });
});

ipcMain.handle("stop-scripts", () => {
  if (currentScriptProcess) {
    currentScriptProcess.kill();
    currentScriptProcess = null;
  }
});

ipcMain.handle("list-scripts", () => {
  const scriptsDir = path.join(__dirname, "../../backend/scripts");

  if (!fs.existsSync(scriptsDir)) {
    console.warn("Scripts folder not found:", scriptsDir);
    return []; // return empty array if folder does not exist
  }
  
  return fs
    .readdirSync(scriptsDir)
    .filter((file) => file.endsWith(".ahk"));
});

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (process.env.ELECTRON_START_URL) {
    // Dev mode: point to local dev server (React, Vue, etc.)
    mainWindow.loadURL(process.env.ELECTRON_START_URL);
  } else {
    // Production: load the packaged HTML file
    mainWindow.loadFile(path.join(__dirname, "index.html"));
  }

  mainWindow.on("closed", function () {
    mainWindow = null;
  });
}

app.on("ready", createWindow);

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", function () {
  if (mainWindow === null) createWindow();
});