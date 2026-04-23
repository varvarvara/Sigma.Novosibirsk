from fastapi import FastAPI

from app.db.base import Base, engine
from app.modules.admin.router import adminRouter
from app.modules.attendance.router import attendanceRouter
from app.modules.auth.router import authRouter
from app.modules.certificates.router import certificatesRouter
from app.modules.course_feedback.router import courseFeedbackRouter
from app.modules.courses.router import courseRouter
from app.modules.enrollment.router import enrollmentRouter
from app.modules.scheduling.router import schedulingRouter
from app.modules.users.router import usersRouter
from app.modules.gamification.router import gamificationRouter
from app.modules.season.router import seasonRouter
from app.modules.solver.router import schedulingmakerRouter

from app.modules.attendance import models as attendance_models  # noqa: F401
from app.modules.course_feedback import models as course_feedback_models  # noqa: F401
from app.modules.courses import models as courses_models  # noqa: F401
from app.modules.enrollment import models as enrollment_models  # noqa: F401
from app.modules.gamification import models as gamification_models  # noqa: F401
from app.modules.scheduling import models as scheduling_models  # noqa: F401
from app.modules.users import models as users_models  # noqa: F401
from app.modules.season import models as season_models  # noqa: F401

app = FastAPI(
    title="Sigma Platform API",
    version="1.0.0",
    description="Sigma.Novosibirsk",
)


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
app.include_router(courseFeedbackRouter)
app.include_router(certificatesRouter)
app.include_router(seasonRouter)
app.include_router(schedulingmakerRouter)