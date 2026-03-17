from fastapi import FastAPI
from app.modules.auth.router import authRouter
from app.modules.courses.router import courseRouter
from app.modules.users.router import usersRouter

app = FastAPI()

@app.get("/health")
def get_health():
    return {"status": "ok"}

app.include_router(authRouter)
app.include_router(usersRouter)
app.include_router(courseRouter)
