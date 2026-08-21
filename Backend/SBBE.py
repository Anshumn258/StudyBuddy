import os
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from google.genai import types
import uvicorn

app = FastAPI(title="StudyBuddy Backend")

# Enable CORS for GitHub Pages frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Gemini Client using Environment Variable
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None


@app.get("/")
def home():
    return {"status": "ok", "message": "StudyBuddy Server is Running!"}


@app.head("/")
def head_home():
    # Handles automated HEAD health checks on Render without 405 errors
    return {"status": "ok"}


@app.post("/api/chat")
async def chat_endpoint(
    query: str = Form(""),
    board: str = Form("CBSE"),
    class_val: str = Form(alias="class", default="10"),
    language: str = Form("English"),
    file: UploadFile = File(None)
):
    if not client:
        return {"reply": "Server configuration error: GEMINI_API_KEY environment variable missing on Render."}

    system_prompt = (
        f"You are StudyBuddy, an expert educational assistant for Indian school curricula.\n"
        f"Target Board: {board}\n"
        f"Target Grade/Class: Class {class_val}\n"
        f"Preferred Response Language: {language}\n"
        f"Instructions: Provide accurate, step-by-step textbook solutions and clear notes. "
        f"Format equations cleanly using standard LaTeX notation."
    )

    contents = [system_prompt]

    if file and file.filename:
        file_bytes = await file.read()
        mime_type = file.content_type or "image/png"
        
        file_part = types.Part.from_bytes(
            data=file_bytes,
            mime_type=mime_type
        )
        contents.append(file_part)

    contents.append(query if query else "Explain the key concepts in this uploaded material.")

    try:
        response = client.models.generate_content(
            model="gemini-1.5-flash",
            contents=contents
        )
        return {"reply": response.text}
    except Exception as e:
        print(f"Gemini API Error: {str(e)}")
        return {"reply": f"An error occurred while generating the solution: {str(e)}"}


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    uvicorn.run(app, host="0.0.0.0", port=port)