import sys
import os
from pathlib import Path


current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.v1 import chat, screen

app = FastAPI(
    title="SpectrumLens AI API",
    description="Backend for AI-driven autism behavioral screening and live tracking.",
    version="1.0.0",
    docs_url="/api/docs",
)


origins = [
    "http://localhost:3000", 
    "https://spectrum-lens.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],              
    allow_headers=["*"],              
)

app.include_router(chat.router, prefix="/api/v1/chat", tags=["AI Chat"])
app.include_router(screen.router, prefix="/api/v1/screen", tags=["Screening"])

@app.get("/")
async def root():
    return {
        "status": "online",
        "message": "SpectrumLens API is Live",
        "docs": "/api/docs"
    }

@app.get("/api/health")
async def health():
    return {"status": "healthy"}



if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)