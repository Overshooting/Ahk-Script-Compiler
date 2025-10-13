document.addEventListener("DOMContentLoaded", () => {
  const scriptListDiv = document.getElementById("script-list");
  const outputArea = document.getElementById("output");
  const scriptListButton = document.getElementById("script-status-btn");
  const openFolderButton = document.getElementById("open-folder-btn");

  function appendLog(script, message, isStatusList) {
    const logEntry = document.createElement("div");

    let spaces = "";
    if (isStatusList) {
      spaces = "     ";
    }

    logEntry.textContent = `${spaces}[${script}] ${message}`;
    outputArea.appendChild(logEntry);
    outputArea.scrollTop = outputArea.scrollHeight;
  }

  async function listScriptStatus() {
    appendLog("System", "Fetching script statuses...");

    let scriptList = await window.api.listScripts();

    if (scriptList.length === 0) {
      appendLog("System", "No scripts found.");
      return;
    }

    for (script of scriptList) {
      appendLog(script, await window.api.getScriptStatus(script), true);
    }
  }

  scriptListButton.addEventListener("click", listScriptStatus);

  async function openScriptFolder() {
    await window.api.openScriptFolder();
  }

  openFolderButton.addEventListener("click", openScriptFolder);

  async function loadScripts() {
    const scripts = await window.api.listScripts();

    scriptListDiv.innerHTML = "";

    if (scripts.length === 0) {
      scriptListDiv.textContent =
        "No .exe scripts found in scriptstorage/scripts/";
      return;
    }

    scripts.forEach((script) => {
      const container = document.createElement("div");
      container.classList.add("script-item");
      const label = document.createElement("span");
      label.textContent = script;
      label.classList.add("script-name");

      const runButton = document.createElement("button");
      runButton.textContent = "Run";
      runButton.classList.add("run-btn");
      runButton.onclick = async () => {
        appendLog(script, "Starting...");
        try {
          const result = await window.api.runScript(script);
          appendLog(script, result?.message || "Script started", false);
        } catch (err) {
          appendLog(script, `Failed to start: ${err.message}`, false);
        }
      };

      container.appendChild(label);
      container.appendChild(runButton);
      scriptListDiv.appendChild(container);
    });
  }

  window.api.onScriptOutput((data) => {
    appendLog(data.script, data.message);
  });

  loadScripts();
});
