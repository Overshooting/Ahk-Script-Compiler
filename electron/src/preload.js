const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  runScript: (scriptPath) => {
    return ipcRenderer.send("run-script", scriptPath);
  },

  listScripts: async () => {
    return ipcRenderer.invoke("list-scripts");
  },

  onScriptOutput: (callback) => {
    ipcRenderer.on("script-output", (event, message) => {
      callback(message);
    });
  },

  getScriptStatus: (scriptName) => {
    return ipcRenderer.invoke("get-script-status", scriptName);
  },

  openScriptFolder: () => {
    return ipcRenderer.invoke("open-script-folder");
  },
});
