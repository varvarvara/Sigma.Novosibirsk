from app.celery_app import celery_app
from app.security.email_service import send_teacher_credentials_email


@celery_app.task(name="send_teacher_credentials_email")
def send_teacher_credentials_email_task(email: str, first_name: str, password: str) -> None:
    send_teacher_credentials_email(
        to_email=email,
        first_name=first_name,
        password=password,
    )
