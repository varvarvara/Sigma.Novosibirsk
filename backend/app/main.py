from fastapi import FastAPI
from app.modules.auth.router import authRouter

app = FastAPI()

@app.get("/health")
def get_health():
    return {"status": "ok"}

app.include_router(authRouter)
