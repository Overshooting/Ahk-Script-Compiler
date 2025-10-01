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
      runButton.onclick = () => {
        appendLog(script, "Script started");
        window.api.runScript(script);
      };

      // Stop button
      const stopButton = document.createElement("button");
      stopButton.textContent = "Stop";
      stopButton.classList.add("stop-btn");
      stopButton.onclick = () => {
        appendLog(script, "stop function wip");
        window.api.stopScript(script);
      };

      container.appendChild(label);
      container.appendChild(runButton);
      container.appendChild(stopButton);
      scriptListDiv.appendChild(container);
    });
  }

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