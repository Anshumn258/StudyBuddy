// Replace with your Render Backend Web Service URL once deployed
const BACKEND_URL = "https://your-studybuddy-backend.onrender.com/api/chat";

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
        const response = await fetch(BACKEND_URL, {
            method: "POST",
            body: formData
        });

        const data = await response.json();
        
        // Parse markdown and math using Marked.js & KaTeX
        const formattedReply = marked.parse(data.reply || "No response generated.");
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
    chatBox.scrollTop = chatBox.scrollHeight;
}

function changeTheme() {
    const theme = document.getElementById("theme-select").value;
    if (theme === "dark") {
        document.body.style.backgroundColor = "#1a1a1a";
        document.body.style.color = "#ffffff";
    } else {
        document.body.style.backgroundColor = "#ffffff";
        document.body.style.color = "#000000";
    }
}

function openSettings() {
    alert("Settings & Personal Notes Library management window.");
}