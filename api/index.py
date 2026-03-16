from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import sys
from pathlib import Path
from dotenv import load_dotenv
import google.generativeai as genai

# Add backend directory to sys.path to find calculator.py
sys.path.append(str(Path(__file__).parent.parent / "backend"))
from calculator import SajuCalculator

# Load .env
env_path = Path(__file__).parent.parent / "backend" / ".env"
load_dotenv(dotenv_path=env_path)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

calculator = SajuCalculator()

# Gemini Setup
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or "AIzaSyCbTZD1m3RHMo-k-zC493Ug6pVr_OavTmg"
model = None
if GEMINI_API_KEY and "AIza" in GEMINI_API_KEY:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        # We'll use gemini-1.5-flash as default for speed
        model = genai.GenerativeModel('gemini-1.5-flash')
        print(f"Gemini API Configured (gemini-1.5-flash)!")
    except Exception as e:
        print(f"Gemini Config Error: {e}")
else:
    print("Gemini API Key NOT FOUND.")

class CalculateRequest(BaseModel):
    year: int
    month: int
    day: int
    hour: int
    minute: int = 0
    gender: str = "male"

class ChatRequest(BaseModel):
    message: str
    saju_data: dict = None

@app.get("/api")
def read_root():
    return {"message": "Saju API is running on Vercel"}

@app.post("/api/calculate")
def calculate_saju(req: CalculateRequest):
    try:
        result = calculator.compute(req.year, req.month, req.day, req.hour, req.minute, req.gender)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat")
async def chat_with_fortune_teller(req: ChatRequest):
    user_msg = req.message
    saju = req.saju_data
    
    if not saju:
        return {"response": "먼저 분석 시작 버튼을 눌러주세요."}

    context = f"""
    User's Saju Chart:
    - Year: {saju['year']['ganji']} ({saju['year']['element']})
    - Month: {saju['month']['ganji']} ({saju['month']['element']})
    - Day: {saju['day']['ganji']} ({saju['day']['element']}) - This is the Day Master (The User).
    - Hour: {saju['hour']['ganji']} ({saju['hour']['element']})
    
    The user asks: "{user_msg}"
    
    Act as a wise, mystical Korean Fortune Teller. 
    Interpret the user's question based on their Day Master ({saju['day']['element']}) and the overall balance of elements.
    Use polite but mystical Korean language.
    """

    if model:
        try:
            response = model.generate_content(context)
            return {"response": response.text}
        except Exception as e:
            return {"response": f"AI 통신 오류 발생: {str(e)}"}
    else:
        day_master = saju.get('day', {}).get('element', 'Unknown')
        return {"response": f"[Mock Mode] 당신은 {day_master}의 기운을 타고났습니다."}
