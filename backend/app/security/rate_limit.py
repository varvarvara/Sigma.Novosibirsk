import hashlib
import logging

from app.security.redis import cache_exists, increment_cache_counter, set_cache_flag

logger = logging.getLogger(__name__)

PASSWORD_RESET_IP_LIMIT = 5
PASSWORD_RESET_IP_WINDOW_SECONDS = 10 * 60
PASSWORD_RESET_EMAIL_COOLDOWN_SECONDS = 3 * 60


def _normalize_email(email: str) -> str:
    return email.strip().lower()


def _hash_email(email: str) -> str:
    return hashlib.sha256(_normalize_email(email).encode("utf-8")).hexdigest()


def _normalize_ip(client_ip: str | None) -> str:
    if not client_ip:
        return "unknown"
    return client_ip.strip() or "unknown"


def is_password_reset_limited(*, email: str, client_ip: str | None) -> bool:
    normalized_ip = _normalize_ip(client_ip)
    ip_key = f"rate:password_reset:ip:{normalized_ip}"
    email_key = f"rate:password_reset:email:{_hash_email(email)}"

    ip_count = increment_cache_counter(
        key=ip_key,
        ttl_seconds=PASSWORD_RESET_IP_WINDOW_SECONDS,
    )
    if ip_count > PASSWORD_RESET_IP_LIMIT:
        logger.warning("Password reset throttled by IP: ip=%s count=%s", normalized_ip, ip_count)
        return True

    if cache_exists(email_key):
        logger.info("Password reset throttled by email cooldown: email_hash=%s", _hash_email(email))
        return True

    return False


def mark_password_reset_sent(email: str) -> None:
    email_hash = _hash_email(email)
    set_cache_flag(
        key=f"rate:password_reset:email:{email_hash}",
        ttl_seconds=PASSWORD_RESET_EMAIL_COOLDOWN_SECONDS,
    )
