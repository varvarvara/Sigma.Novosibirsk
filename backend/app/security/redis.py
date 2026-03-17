import json
import os
import time
from pathlib import Path

from dotenv import load_dotenv
from redis import Redis
from redis.exceptions import RedisError

BASE_DIR = Path(__file__).resolve().parents[2]
load_dotenv(BASE_DIR / ".env")

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
class TokenStore:
    def __init__(self):
        self._redis: Redis | None = None
        self._refresh_tokens_memory: dict[str, dict] = {}
        self._blacklisted_jti_memory: dict[str, int] = {}
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


class CacheStore:
    def __init__(self, redis_client: Redis | None):
        self._redis = redis_client

    def set_json(self, key: str, value: dict, ttl_seconds: int = 300) -> None:
        if not self._redis:
            return
        self._redis.setex(key, max(ttl_seconds, 1), json.dumps(value))

    def get_json(self, key: str) -> dict | None:
        if not self._redis:
            return None
        raw = self._redis.get(key)
        if not raw:
            return None
        return json.loads(raw)

    def delete(self, key: str) -> None:
        if not self._redis:
            return
        self._redis.delete(key)


token_store = TokenStore()
cache_store = CacheStore(token_store._redis)


def set_cache(key: str, value: dict, ttl_seconds: int = 300) -> None:
    cache_store.set_json(key=key, value=value, ttl_seconds=ttl_seconds)


def get_cache(key: str) -> dict | None:
    return cache_store.get_json(key=key)


def delete_cache(key: str) -> None:
    cache_store.delete(key=key)


def gamification_cache_key(student_id: int) -> str:
    return f"gamification:student:{student_id}"
