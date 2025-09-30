const { contextBridge, ipcRenderer } = require("electron");

/**
 * Expose a safe API to the renderer
 * All methods here use ipcRenderer to communicate with the main process
 */
contextBridge.exposeInMainWorld("api", {
  /**
   * Run a script at the given path
   * @param {string} scriptPath - Relative or absolute path to the script
   */
  runScript: async (scriptPath) => {
    return ipcRenderer.invoke("run-script", scriptPath);
  },

  /**
   * Stop all currently running scripts
   */
  stopScripts: () => {
    return ipcRenderer.invoke("stop-scripts");
  },

  /**
   * List all available scripts in the backend
   * Returns an array of filenames
   */
  listScripts: async () => {
    return ipcRenderer.invoke("list-scripts");
  },

  /**
   * Listen for script output from main process
   * @param {function} callback - Function called with each message
   */
  onScriptOutput: (callback) => {
    ipcRenderer.on("script-output", (event, message) => {
      callback(message);
    });
  },
});