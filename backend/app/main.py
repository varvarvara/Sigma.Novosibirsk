from fastapi import FastAPI

from app.db.base import Base, engine
from app.modules.admin.router import adminRouter
from app.modules.attendance.router import attendanceRouter
from app.modules.auth.router import authRouter
from app.modules.courses.router import courseRouter
from app.modules.enrollment.router import enrollmentRouter
from app.modules.scheduling.router import schedulingRouter
from app.modules.users.router import usersRouter
from app.modules.gamification.router import gamificationRouter

# Import model modules so SQLAlchemy registers all tables before create_all
from app.modules.attendance import models as attendance_models  # noqa: F401
from app.modules.courses import models as courses_models  # noqa: F401
from app.modules.enrollment import models as enrollment_models  # noqa: F401
from app.modules.gamification import models as gamification_models  # noqa: F401
from app.modules.scheduling import models as scheduling_models  # noqa: F401
from app.modules.users import models as users_models  # noqa: F401

app = FastAPI()


@app.on_event("startup")
def startup_create_tables() -> None:
    # For local/dev launch without migrations.
    Base.metadata.create_all(bind=engine)


@app.get("/health")
def get_health():
    return {"status": "ok"}


app.include_router(authRouter)
app.include_router(usersRouter)
app.include_router(adminRouter)
app.include_router(courseRouter)
app.include_router(enrollmentRouter)
app.include_router(schedulingRouter)
app.include_router(attendanceRouter)
app.include_router(gamificationRouter)