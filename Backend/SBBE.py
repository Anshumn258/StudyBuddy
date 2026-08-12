from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from google import genai
import os

app = FastAPI(title="StudyBuddy Backend")

# Enable CORS for GitHub Pages frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows requests from your GitHub Pages URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Gemini Client using Environment Variable GEMINI_API_KEY
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None

@app.get("/")
def home():
    return {"message": "StudyBuddy Server is Running!"}

@app.post("/api/chat")
async def chat_endpoint(
    query: str = Form(""),
    board: str = Form("CBSE"),
    class_val: str = Form(alias="class", default="10"),
    language: str = Form("English"),
    file: UploadFile = File(None)
):
    if not client:
        return {"reply": "Server configuration error: API key missing."}

    # Construct System Prompt to ground the AI as a tutor
    system_prompt = (
        f"You are StudyBuddy, an expert educational assistant for Indian school curricula.\n"
        f"Target Board: {board}\n"
        f"Target Grade/Class: Class {class_val}\n"
        f"Preferred Response Language: {language}\n"
        f"Instructions: Provide accurate, step-by-step textbook solutions and clear notes. "
        f"Format equations cleanly using standard LaTeX notation."
    )

    contents = [system_prompt]

    # Process file input (images/PDFs) if uploaded by student
    if file:
        file_bytes = await file.read()
        contents.append({
            "mime_type": file.content_type,
            "data": file_bytes
        })

    contents.append(query if query else "Explain the key concepts in this uploaded material.")

    try:
        response = client.models.generate_content(
            model="gemini-1.5-flash",
            contents=contents
        )
        return {"reply": response.text}
    except Exception as e:
        return {"reply": f"An error occurred while generating the solution: {str(e)}"}