const BACKEND_URL = "https://studybuddy-backend-m8ov.onrender.com";

function toggleSidebar() {
    document.getElementById("sidebar").classList.toggle("collapsed");
}

function handleFileSelect() {
    const fileInput = document.getElementById("file-upload");
    const nameDisplay = document.getElementById("file-name-display");
    if (fileInput.files.length > 0) {
        nameDisplay.textContent = fileInput.files[0].name;
    } else {
        nameDisplay.textContent = "";
    }
}

async function sendMessage() {
    const inputField = document.getElementById("user-input");
    const query = inputField.value.trim();
    const board = document.getElementById("board-select").value;
    const grade = document.getElementById("class-select").value;
    const language = document.getElementById("language-select").value;
    const fileInput = document.getElementById("file-upload");

    if (!query && fileInput.files.length === 0) return;

    // Append User Message to UI
    appendMessage(query || "Uploaded file for analysis", "user-message");
    inputField.value = "";

    // Prepare Form Data payload
    const formData = new FormData();
    formData.append("query", query);
    formData.append("board", board);
    formData.append("class", grade);
    formData.append("language", language);

    if (fileInput.files.length > 0) {
        formData.append("file", fileInput.files[0]);
    }

    // Show Loading Spinner for Render Cold Starts
    const spinner = document.getElementById("loading-spinner");
    spinner.classList.remove("hidden");

    try {
        // FIXED: Sending request specifically to /api/chat endpoint
        const response = await fetch(`${BACKEND_URL}/api/chat`, {
            method: "POST",
            body: formData
        });

        const data = await response.json();
        
        // Parse markdown and math
        const rawReply = data.reply || "No response generated.";
        const formattedReply = marked.parse(rawReply);
        appendMessage(formattedReply, "bot-message");

    } catch (error) {
        console.error("Error connecting to backend:", error);
        appendMessage("⚠️ Connection error. If the free backend server was sleeping, please try again in 20 seconds.", "bot-message");
    } finally {
        spinner.classList.add("hidden");
        fileInput.value = "";
        document.getElementById("file-name-display").textContent = "";
    }
}

function appendMessage(content, className) {
    const chatBox = document.getElementById("chat-box");
    const msgDiv = document.createElement("div");
    msgDiv.className = `message ${className}`;
    msgDiv.innerHTML = content;
    chatBox.appendChild(msgDiv);
    
    // Auto-render KaTeX math formulas if available
    if (window.renderMathInElement) {
        renderMathInElement(msgDiv, {
            delimiters: [
                {left: "$$", right: "$$", display: true},
                {left: "$", right: "$", display: false}
            ]
        });
    }

    chatBox.scrollTop = chatBox.scrollHeight;
}

/* Dark Theme Toggle Logic */
function changeTheme() {
    const theme = document.getElementById("theme-select").value;
    if (theme === "dark") {
        document.body.classList.add("dark-mode");
    } else {
        document.body.classList.remove("dark-mode");
    }
}

/* Modal / Settings Dialog Logic */
function openSettings() {
    const modal = document.getElementById("settings-modal");
    modal.classList.remove("hidden");
    
    // Calculate simple storage status
    const storageStatus = document.getElementById("storage-status");
    const usedBytes = JSON.stringify(localStorage).length;
    storageStatus.textContent = `Local storage used: ${(usedBytes / 1024).toFixed(2)} KB`;
}

function closeSettings() {
    const modal = document.getElementById("settings-modal");
    modal.classList.add("hidden");
}

function clearNotesStorage() {
    if (confirm("Are you sure you want to clear cached notes and chat history?")) {
        localStorage.clear();
        alert("Storage cleared successfully!");
        closeSettings();
    }
}