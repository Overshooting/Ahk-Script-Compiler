// Grab DOM elements
const scriptSelect = document.getElementById("scriptSelect");
const runButton = document.getElementById("runButton");
const stopButton = document.getElementById("stopButton");
const outputArea = document.getElementById("outputArea");

/**
 * Load available scripts into the dropdown
 */
async function loadScripts() {
    const scripts = await window.api.listScripts(); // Calls main process via preload

    // Clear existing options
    scriptSelect.innerHTML = "";

    if (scripts.length === 0) {
        const option = document.createElement("option");
        option.textContent = "No scripts found";
        option.disabled = true;
        scriptSelect.appendChild(option);
        return;
    }

    // Populate dropdown
    scripts.forEach((script) => {
        const option = document.createElement("option");
        option.value = script;
        option.textContent = script;
        scriptSelect.appendChild(option);
    });
}

/**
 * Append message to output area
 */
function appendOutput(message) {
    outputArea.textContent += message + "\n";
    outputArea.scrollTop = outputArea.scrollHeight; // Auto-scroll to bottom
}

/**
 * Run selected script
 */
async function runScript() {
    const selectedScript = scriptSelect.value;
    if (!selectedScript) return;

    appendOutput(`Running script: ${selectedScript}`);

    try {
        // Construct full path relative to backend/scripts folder
        const scriptPath = `../../backend/scripts/${selectedScript}`;
        await window.api.runScript(scriptPath);
    } catch (error) {
        appendOutput(`Error running script: ${error}`);
    }
}

/**
 * Stop currently running script
 */
function stopScript() {
    window.api.stopScripts();
    appendOutput("Stopped all running scripts.");
}

/**
 * Listen for script output from main process
 */
window.api.onScriptOutput((message) => {
    appendOutput(message);
});

// Attach event listeners
runButton.addEventListener("click", runScript);
stopButton.addEventListener("click", stopScript);

// Initial load
loadScripts();