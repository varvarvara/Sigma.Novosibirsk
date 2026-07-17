import json
import time
from urllib.parse import quote

from redis import Redis
from redis.exceptions import RedisError

from app.config import settings


def _build_redis_url() -> str:
    redis_url = settings.REDIS_URL
    if redis_url:
        return redis_url

    host = settings.REDIS_HOST
    port = str(settings.REDIS_PORT)
    db = str(settings.REDIS_DB)
    password = settings.REDIS_PASSWORD or ""

    if password and password.lower() not in {"none", "null"}:
        encoded_password = quote(password, safe="")
        return f"redis://:{encoded_password}@{host}:{port}/{db}"

    return f"redis://{host}:{port}/{db}"


REDIS_URL = _build_redis_url()
class TokenStore:
    def __init__(self):
        self._redis: Redis | None = None
        self._refresh_tokens_memory: dict[str, dict] = {}
        self._blacklisted_jti_memory: dict[str, int] = {}
        self._password_reset_memory: dict[str, dict] = {}
        self._init_redis()

    def _init_redis(self) -> None:
        try:
            client = Redis.from_url(REDIS_URL, decode_responses=True)
            client.ping()
            self._redis = client
        except RedisError:
            self._redis = None

    @staticmethod
    def _now_ts() -> int:
        return int(time.time())

    def _cleanup_memory(self) -> None:
        now_ts = self._now_ts()

        for refresh_token, info in list(self._refresh_tokens_memory.items()):
            if info["exp"] <= now_ts:
                self._refresh_tokens_memory.pop(refresh_token, None)

        for token_jti, exp_ts in list(self._blacklisted_jti_memory.items()):
            if exp_ts <= now_ts:
                self._blacklisted_jti_memory.pop(token_jti, None)

        for reset_token, info in list(self._password_reset_memory.items()):
            if info["exp"] <= now_ts:
                self._password_reset_memory.pop(reset_token, None)

    def save_refresh(self, refresh_token: str, payload: dict, ttl_seconds: int) -> None:
        ttl = max(ttl_seconds, 1)
        if self._redis:
            self._redis.setex(f"auth:refresh:{refresh_token}", ttl, json.dumps(payload))
            return

        self._refresh_tokens_memory[refresh_token] = {
            "payload": payload,
            "exp": self._now_ts() + ttl,
        }

    def get_refresh(self, refresh_token: str) -> dict | None:
        if self._redis:
            raw = self._redis.get(f"auth:refresh:{refresh_token}")
            if not raw:
                return None
            return json.loads(raw)

        self._cleanup_memory()
        info = self._refresh_tokens_memory.get(refresh_token)
        if not info:
            return None
        return info["payload"]

    def revoke_refresh(self, refresh_token: str) -> None:
        if self._redis:
            self._redis.delete(f"auth:refresh:{refresh_token}")
            return

        self._refresh_tokens_memory.pop(refresh_token, None)

    def blacklist(self, token_jti: str, access_exp_ts: int) -> None:
        ttl = max(access_exp_ts - self._now_ts(), 1)
        if self._redis:
            self._redis.setex(f"auth:blacklist:{token_jti}", ttl, "1")
            return

        self._blacklisted_jti_memory[token_jti] = access_exp_ts

    def is_blacklisted(self, token_jti: str) -> bool:
        if self._redis:
            return self._redis.exists(f"auth:blacklist:{token_jti}") == 1

        self._cleanup_memory()
        return token_jti in self._blacklisted_jti_memory

    def save_password_reset(self, reset_token: str, payload: dict, ttl_seconds: int) -> None:
        ttl = max(ttl_seconds, 1)
        if self._redis:
            self._redis.setex(f"auth:password_reset:{reset_token}", ttl, json.dumps(payload))
            return

        self._password_reset_memory[reset_token] = {
            "payload": payload,
            "exp": self._now_ts() + ttl,
        }

    def get_password_reset(self, reset_token: str) -> dict | None:
        if self._redis:
            raw = self._redis.get(f"auth:password_reset:{reset_token}")
            if not raw:
                return None
            return json.loads(raw)

        self._cleanup_memory()
        info = self._password_reset_memory.get(reset_token)
        if not info:
            return None
        return info["payload"]

    def revoke_password_reset(self, reset_token: str) -> None:
        if self._redis:
            self._redis.delete(f"auth:password_reset:{reset_token}")
            return

        self._password_reset_memory.pop(reset_token, None)


class CacheStore:
    def __init__(self, redis_client: Redis | None):
        self._redis = redis_client
        self._memory: dict[str, dict] = {}

    def set_json(self, key: str, value: dict, ttl_seconds: int = 300) -> None:
        if not self._redis:
            self._memory[key] = {
                "value": value,
                "exp": TokenStore._now_ts() + max(ttl_seconds, 1),
            }
            return
        self._redis.setex(key, max(ttl_seconds, 1), json.dumps(value))

    def get_json(self, key: str) -> dict | None:
        if not self._redis:
            item = self._memory.get(key)
            if not item:
                return None
            if int(item["exp"]) <= TokenStore._now_ts():
                self._memory.pop(key, None)
                return None
            return item["value"]
        raw = self._redis.get(key)
        if not raw:
            return None
        return json.loads(raw)

    def delete(self, key: str) -> None:
        if not self._redis:
            self._memory.pop(key, None)
            return
        self._redis.delete(key)

    def exists(self, key: str) -> bool:
        if self._redis:
            return self._redis.exists(key) == 1
        return self.get_json(key) is not None

    def set_flag(self, key: str, ttl_seconds: int) -> None:
        ttl = max(ttl_seconds, 1)
        if self._redis:
            self._redis.setex(key, ttl, "1")
            return
        self._memory[key] = {
            "value": {"value": "1"},
            "exp": TokenStore._now_ts() + ttl,
        }

    def increment(self, key: str, ttl_seconds: int) -> int:
        ttl = max(ttl_seconds, 1)
        if self._redis:
            value = int(self._redis.incr(key))
            if value == 1:
                self._redis.expire(key, ttl)
            return value

        item = self._memory.get(key)
        now_ts = TokenStore._now_ts()
        if not item or int(item["exp"]) <= now_ts:
            self._memory[key] = {
                "value": {"count": 1},
                "exp": now_ts + ttl,
            }
            return 1

        value = int(item["value"].get("count", 0)) + 1
        item["value"]["count"] = value
        return value


token_store = TokenStore()
cache_store = CacheStore(token_store._redis)


def set_cache(key: str, value: dict, ttl_seconds: int = 300) -> None:
    cache_store.set_json(key=key, value=value, ttl_seconds=ttl_seconds)


def get_cache(key: str) -> dict | None:
    return cache_store.get_json(key=key)


def delete_cache(key: str) -> None:
    cache_store.delete(key=key)


def cache_exists(key: str) -> bool:
    return cache_store.exists(key=key)


def set_cache_flag(key: str, ttl_seconds: int) -> None:
    cache_store.set_flag(key=key, ttl_seconds=ttl_seconds)


def increment_cache_counter(key: str, ttl_seconds: int) -> int:
    return cache_store.increment(key=key, ttl_seconds=ttl_seconds)


def gamification_cache_key(student_id: int) -> str:
    return f"gamification:student:{student_id}"
