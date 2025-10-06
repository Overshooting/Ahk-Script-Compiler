// ============================
// Renderer Process (Frontend JS)
// ============================

// Expects "window.api" exposed from preload.js
// Handles: script list, running/stopping, displaying logs

document.addEventListener("DOMContentLoaded", () => {
  // ----------------------------
  // DOM Elements
  // ----------------------------
  const scriptListDiv = document.getElementById("script-list");
  const outputArea = document.getElementById("output");
  const stopAllButton = document.getElementById("stop-all-btn");

  // ----------------------------
  // Utility: Append log messages
  // ----------------------------
  function appendLog(script, message) {
    const logEntry = document.createElement("div");
    logEntry.textContent = `[${script}] ${message}`;
    outputArea.appendChild(logEntry);
    outputArea.scrollTop = outputArea.scrollHeight; // auto-scroll
  }

  // ----------------------------
  // Load available scripts
  // ----------------------------
  async function loadScripts() {
    const scripts = await window.api.listScripts();

    scriptListDiv.innerHTML = ""; // clear old entries

    if (scripts.length === 0) {
      scriptListDiv.textContent = "No .exe scripts found in backend/scripts/";
      return;
    }

    scripts.forEach((script) => {
      // Container for each script row
      const container = document.createElement("div");
      container.classList.add("script-item");

      // Script name label
      const label = document.createElement("span");
      label.textContent = script;
      label.classList.add("script-name");

      // Run button
      const runButton = document.createElement("button");
      runButton.textContent = "Run";
      runButton.classList.add("run-btn");
      runButton.onclick = async () => {
        appendLog(script, "Starting...");
        try {
          const result = await window.api.runScript(script);
          appendLog(script, result?.message || "Script started");
        } catch (err) {
          appendLog(script, `Failed to start: ${err.message}`);
        }
      };

      // Stop button
      const stopButton = document.createElement("button");
      stopButton.textContent = "Stop";
      stopButton.classList.add("stop-btn");
      stopButton.onclick = async () => {
        appendLog(script, "Stopping...");
        try {
          const result = await window.api.stopScript(script);
          appendLog(script, result?.message || "Script stopped");
        } catch (err) {
          appendLog(script, `Failed to stop: ${err.message}`);
        }
      };

      container.appendChild(label);
      container.appendChild(runButton);
      container.appendChild(stopButton);
      scriptListDiv.appendChild(container);
    });
  }

  // ----------------------------
  // Stop all scripts
  // ----------------------------
  stopAllButton?.addEventListener("click", async () => {
    appendLog("ALL", "Stopping all running AHK scripts...");
    try {
      const result = await window.api.stopScripts();
      appendLog("ALL", result?.message || "All scripts stopped.");
    } catch (err) {
      appendLog("ALL", `Failed to stop all scripts: ${err.message}`);
    }
  });

  // ----------------------------
  // Listen for script output
  // ----------------------------
  window.api.onScriptOutput((data) => {
    appendLog(data.script, data.message);
  });

  // ----------------------------
  // Initial load
  // ----------------------------
  loadScripts();
});
