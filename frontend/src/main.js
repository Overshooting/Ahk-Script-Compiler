// ============================
// Main Electron Process
// ============================

const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const fs = require("fs");

if (process.env.NODE_ENV !== "production") {
  require("electron-reload")(__dirname);
}

// ----------------------------
// Track running scripts
// ----------------------------
let runningProcesses = {};

// ----------------------------
// Utility: Resolve script path safely
// ----------------------------
function resolveScriptPath(scriptName) {
  const scriptsDir = path.join(__dirname, "../../backend/scripts");
  const fullPath = path.join(scriptsDir, scriptName);

  if (!fs.existsSync(fullPath)) {
    throw new Error(`Script not found: ${scriptName}`);
  }
  return fullPath;
}

// ----------------------------
// IPC: List available scripts
// ----------------------------
ipcMain.handle("list-scripts", () => {
  const scriptsDir = path.join(__dirname, "../../backend/scripts");

  if (!fs.existsSync(scriptsDir)) {
    console.warn("Scripts folder not found:", scriptsDir);
    return [];
  }

  return fs.readdirSync(scriptsDir).filter((file) => file.endsWith(".exe"));
});

// ----------------------------
// IPC: Run a script
// ----------------------------
ipcMain.on("run-script", (event, scriptName) => {
  try {
    const scriptPath = resolveScriptPath(scriptName);

    // Spawn the process
    const child = spawn(scriptPath, [], { shell: true });
    runningProcesses[scriptName] = child;

    // Setup logging
    const logsDir = path.join(__dirname, "../../backend/logs");
    if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir);

    const logFile = fs.createWriteStream(
      path.join(logsDir, `${scriptName}.log`),
      { flags: "a" }
    );
    child.stdout.pipe(logFile);
    child.stderr.pipe(logFile);

    // Forward output to renderer
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

    // Cleanup when process exits
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

// ----------------------------
// IPC: Stop a script
// ----------------------------
ipcMain.on("stop-script", (event, scriptName) => {
  if (runningProcesses[scriptName]) {
    runningProcesses[scriptName].kill();
    delete runningProcesses[scriptName];

    event.sender.send("script-output", {
      script: scriptName,
      message: `Script "${scriptName}" was stopped.`,
    });
  } else {
    event.sender.send("script-output", {
      script: scriptName,
      message: `No running process found for "${scriptName}".`,
    });
  }
});

// ----------------------------
// Window creation
// ----------------------------
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
    // Dev mode: point to local dev server
    mainWindow.loadURL(process.env.ELECTRON_START_URL);
  } else {
    // Production: load local HTML
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