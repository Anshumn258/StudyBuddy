const BACKEND_URL = "https://studybuddy-backend-m8ov.onrender.com";

function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    if (sidebar) sidebar.classList.toggle("collapsed");
}

function handleFileSelect() {
    const fileInput = document.getElementById("file-upload");
    const nameDisplay = document.getElementById("file-name-display");
    if (fileInput && fileInput.files.length > 0) {
        nameDisplay.textContent = fileInput.files[0].name;
    } else if (nameDisplay) {
        nameDisplay.textContent = "";
    }
}

async function sendMessage() {
    const inputField = document.getElementById("user-input");
    const boardSelect = document.getElementById("board-select");
    const classSelect = document.getElementById("class-select");
    const langSelect = document.getElementById("language-select");
    const fileInput = document.getElementById("file-upload");
    const sendBtn = document.getElementById("send-btn");
    const spinner = document.getElementById("loading-spinner");

    const query = inputField ? inputField.value.trim() : "";
    const board = boardSelect ? boardSelect.value : "CBSE";
    const grade = classSelect ? classSelect.value : "10";
    const language = langSelect ? langSelect.value : "English";

    if (!query && (!fileInput || fileInput.files.length === 0)) return;

    // Prevent double clicking while waiting for response
    if (sendBtn) sendBtn.disabled = true;

    // Display user query in chat UI
    appendMessage(query || "Uploaded file for analysis", "user-message");
    if (inputField) inputField.value = "";

    const formData = new FormData();
    formData.append("query", query);
    formData.append("board", board);
    formData.append("class", grade);
    formData.append("language", language);

    if (fileInput && fileInput.files.length > 0) {
        formData.append("file", fileInput.files[0]);
    }

    if (spinner) spinner.classList.remove("hidden");

    try {
        const response = await fetch(`${https://studybuddy-backend-m8ov.onrender.com}/api/chat`, {
            method: "POST",
            body: formData
        });

        const data = await response.json();
        
        let replyText = data.reply || "No response generated.";
        
        // Parse markdown if marked library exists
        if (window.marked && typeof window.marked.parse === "function") {
            replyText = window.marked.parse(replyText);
        }
        
        appendMessage(replyText, "bot-message");

    } catch (error) {
        console.error("Error connecting to backend:", error);
        appendMessage("⚠️ Connection error. If the free backend server was sleeping, please try again in 20 seconds.", "bot-message");
    } finally {
        if (spinner) spinner.classList.add("hidden");
        if (sendBtn) sendBtn.disabled = false;
        if (fileInput) fileInput.value = "";
        const nameDisplay = document.getElementById("file-name-display");
        if (nameDisplay) nameDisplay.textContent = "";
    }
}

function appendMessage(content, className) {
    const chatBox = document.getElementById("chat-box");
    if (!chatBox) return;

    const msgDiv = document.createElement("div");
    msgDiv.className = `message ${className}`;
    msgDiv.innerHTML = content;
    chatBox.appendChild(msgDiv);

    // Render KaTeX Math Formulas if available
    if (window.renderMathInElement) {
        try {
            renderMathInElement(msgDiv, {
                delimiters: [
                    {left: "$$", right: "$$", display: true},
                    {left: "$", right: "$", display: false}
                ]
            });
        } catch (e) {
            console.warn("KaTeX render issue:", e);
        }
    }

    chatBox.scrollTop = chatBox.scrollHeight;
}

function changeTheme() {
    const themeSelect = document.getElementById("theme-select");
    if (!themeSelect) return;

    if (themeSelect.value === "dark") {
        document.body.classList.add("dark-mode");
    } else {
        document.body.classList.remove("dark-mode");
    }
}

function openSettings() {
    const modal = document.getElementById("settings-modal");
    if (modal) {
        modal.classList.remove("hidden");
        const storageStatus = document.getElementById("storage-status");
        if (storageStatus) {
            const bytes = JSON.stringify(localStorage).length;
            storageStatus.textContent = `Local Storage Used: ${(bytes / 1024).toFixed(2)} KB`;
        }
    }
}

function closeSettings() {
    const modal = document.getElementById("settings-modal");
    if (modal) modal.classList.add("hidden");
}

function clearNotesStorage() {
    if (confirm("Are you sure you want to clear cached study notes?")) {
        localStorage.clear();
        alert("Cache cleared!");
        closeSettings();
    }
}