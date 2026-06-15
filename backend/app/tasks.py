from app.celery_app import celery_app
from app.security.email_service import (
    send_password_reset_email,
    send_teacher_credentials_email,
    send_teacher_password_setup_email,
)


@celery_app.task(name="send_teacher_credentials_email")
def send_teacher_credentials_email_task(email: str, first_name: str, password: str) -> None:
    send_teacher_credentials_email(
        to_email=email,
        first_name=first_name,
        password=password,
    )


@celery_app.task(name="send_teacher_password_setup_email")
def send_teacher_password_setup_email_task(email: str, first_name: str, setup_url: str) -> None:
    send_teacher_password_setup_email(
        to_email=email,
        first_name=first_name,
        setup_url=setup_url,
    )


@celery_app.task(name="send_password_reset_email")
def send_password_reset_email_task(email: str, reset_url: str) -> None:
    send_password_reset_email(to_email=email, reset_url=reset_url)
