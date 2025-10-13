const path = require("path");
const os = require("os");
const fs = require("fs");
const { app, BrowserWindow, ipcMain } = require("electron");
const { spawn } = require("child_process");
const { get } = require("http");

try {
  if (process.env.NODE_ENV !== "production" && process.defaultApp) {
    require("electron-reload")(__dirname);
  }
} catch (err) {
  console.log("electron-reload disabled in production");
}

let runningProcesses = {};

//Establish base path
function getBasePath() {
  const userData = app.getPath("userData");
  const scriptsDir = path.join(userData, "scriptstorage", "scripts");

  if (!fs.existsSync(scriptsDir)) {
    fs.mkdirSync(scriptsDir, { recursive: true });
  }

  return { scriptsDir };
}

module.exports = { getBasePath };

// Find script path
function resolveScriptPath(scriptName) {
  const { scriptsDir } = getBasePath();
  const fullPath = path.join(scriptsDir, scriptName);

  if (!fs.existsSync(fullPath)) {
    throw new Error(`Script not found: ${scriptName}`);
  }
  return fullPath;
}

// List found scripts
ipcMain.handle("list-scripts", () => {
  const { scriptsDir } = getBasePath();

  if (!fs.existsSync(scriptsDir)) {
    console.log("Scripts folder not found:", scriptsDir);
    return [];
  }

  return fs.readdirSync(scriptsDir).filter((file) => file.endsWith(".exe"));
});

// Run a selected script
ipcMain.on("run-script", (event, scriptName) => {
  try {
    const scriptPath = resolveScriptPath(scriptName);

    const child = spawn(scriptPath, [], { shell: true });
    runningProcesses[scriptName] = child;

    child.stdout.on("data", (data) => {
      event.sender.send("script-output", {
        script: scriptName,
        message: data.toString(),
      });
    });

    child.stderr.on("data", (data) => {
      event.sender.send("script-output", {
        script: scriptName,
        message: `ERROR: ${data.toString()}`,
      });
    });

    child.on("exit", (code) => {
      event.sender.send("script-output", {
        script: scriptName,
        message: `Script exited with code ${code}`,
      });
      delete runningProcesses[scriptName];
    });
  } catch (err) {
    event.sender.send("script-output", {
      script: scriptName,
      message: `Failed to run script: ${err.message}`,
    });
  }
});

//Get status of a script
ipcMain.handle("get-script-status", (event, scriptName) => {
  if (runningProcesses[scriptName]) {
    return "Running";
  } else {
    return "Not Running";
  }
});

ipcMain.handle("open-script-folder", () => {
  const { scriptsDir } = getBasePath();
  require("electron").shell.openPath(scriptsDir);
});

// Create window
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
    mainWindow.loadURL(process.env.ELECTRON_START_URL);
  } else {
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
