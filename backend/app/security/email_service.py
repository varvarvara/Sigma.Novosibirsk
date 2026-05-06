import smtplib
from email.message import EmailMessage

from app.config import settings


def _smtp_is_configured() -> bool:
    return bool(settings.SMTP_HOST and settings.SMTP_FROM)


def send_email(to_email: str, subject: str, body: str) -> None:
    if not _smtp_is_configured():
        raise RuntimeError("SMTP is not configured: SMTP_HOST and SMTP_FROM are required")

    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = settings.SMTP_FROM
    message["To"] = to_email
    message.set_content(body)

    if settings.SMTP_USE_SSL:
        with smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, timeout=20) as smtp:
            if settings.SMTP_USERNAME and settings.SMTP_PASSWORD:
                smtp.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            smtp.send_message(message)
        return

    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=20) as smtp:
        if settings.SMTP_USE_STARTTLS:
            smtp.starttls()
        if settings.SMTP_USERNAME and settings.SMTP_PASSWORD:
            smtp.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
        smtp.send_message(message)


def send_teacher_credentials_email(*, to_email: str, first_name: str, password: str) -> None:
    subject = "Доступ к Sigma.Novosibirsk"
    body = (
        f"Здравствуйте, {first_name}!\n\n"
        "Ваша заявка преподавателя одобрена.\n"
        f"Логин: {to_email}\n"
        f"Пароль: {password}\n"
    )
    send_email(to_email=to_email, subject=subject, body=body)
