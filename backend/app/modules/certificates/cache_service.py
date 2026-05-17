import json
import os
from datetime import timedelta
from pathlib import Path
from typing import Any, Dict, List, Optional

import redis
from dotenv import load_dotenv

BACKEND_DIR = Path(__file__).resolve().parents[3]
load_dotenv(BACKEND_DIR / ".env")


def _normalize_password(value: Optional[str]) -> Optional[str]:
    if value is None:
        return None
    cleaned = value.strip()
    if cleaned == "" or cleaned.lower() in {"none", "null"}:
        return None
    return cleaned


class CacheService:
    def __init__(
        self,
        url: Optional[str] = None,
        host: str = "localhost",
        port: int = 6379,
        db: int = 0,
        password: Optional[str] = None,
        decode_responses: bool = True,
    ):
        if url:
            self.redis_client = redis.Redis.from_url(url, decode_responses=decode_responses)
        else:
            self.redis_client = redis.Redis(
                host=host,
                port=port,
                db=db,
                password=password,
                decode_responses=decode_responses,
            )

    @staticmethod
    def _to_cache_value(value: Any) -> str:
        if isinstance(value, str):
            return value
        return json.dumps(value, ensure_ascii=False)

    @staticmethod
    def _from_cache_value(value: Optional[str]) -> Optional[Any]:
        if value is None:
            return None
        try:
            return json.loads(value)
        except (json.JSONDecodeError, TypeError):
            return value

    def set(self, key: str, value: Any, expire: Optional[timedelta] = None) -> bool:
        try:
            payload = self._to_cache_value(value=value)
            if expire is not None:
                ttl = int(expire.total_seconds())
                if ttl <= 0:
                    ttl = 1
                return bool(self.redis_client.setex(key, ttl, payload))
            return bool(self.redis_client.set(key, payload))
        except redis.RedisError as e:
            print(f"Error setting cache: {e}")
            return False

    def get(self, key: str) -> Optional[Any]:
        try:
            value = self.redis_client.get(key)
            return self._from_cache_value(value=value)
        except redis.RedisError as e:
            print(f"Error getting cache: {e}")
            return None

    def delete(self, key: str) -> bool:
        try:
            return self.redis_client.delete(key) > 0
        except redis.RedisError as e:
            print(f"Error deleting cache: {e}")
            return False

    def delete_pattern(self, pattern: str) -> int:
        try:
            keys = list(self.redis_client.scan_iter(match=pattern, count=500))
            if not keys:
                return 0
            return int(self.redis_client.delete(*keys))
        except redis.RedisError as e:
            print(f"Error deleting pattern: {e}")
            return 0

    def exists(self, key: str) -> bool:
        try:
            return self.redis_client.exists(key) > 0
        except redis.RedisError as e:
            print(f"Error checking existence: {e}")
            return False

    def expire(self, key: str, seconds: int) -> bool:
        try:
            return bool(self.redis_client.expire(key, seconds))
        except redis.RedisError as e:
            print(f"Error setting expiration: {e}")
            return False

    def increment(self, key: str, amount: int = 1) -> Optional[int]:
        try:
            return int(self.redis_client.incr(key, amount))
        except redis.RedisError as e:
            print(f"Error incrementing: {e}")
            return None

    def hset(self, hash_name: str, key: str, value: Any) -> bool:
        try:
            payload = self._to_cache_value(value=value)
            self.redis_client.hset(hash_name, key, payload)
            return True
        except redis.RedisError as e:
            print(f"Error setting hash field: {e}")
            return False

    def hget(self, hash_name: str, key: str) -> Optional[Any]:
        try:
            value = self.redis_client.hget(hash_name, key)
            return self._from_cache_value(value=value)
        except redis.RedisError as e:
            print(f"Error getting hash field: {e}")
            return None

    def hgetall(self, hash_name: str) -> Dict[str, Any]:
        try:
            raw = self.redis_client.hgetall(hash_name)
            parsed: Dict[str, Any] = {}
            for key, value in raw.items():
                parsed[key] = self._from_cache_value(value=value)
            return parsed
        except redis.RedisError as e:
            print(f"Error getting all hash fields: {e}")
            return {}

    def lpush(self, key: str, *values: Any) -> bool:
        try:
            payload = [self._to_cache_value(value=value) for value in values]
            self.redis_client.lpush(key, *payload)
            return True
        except redis.RedisError as e:
            print(f"Error pushing to list: {e}")
            return False

    def lrange(self, key: str, start: int = 0, end: int = -1) -> List[Any]:
        try:
            values = self.redis_client.lrange(key, start, end)
            return [self._from_cache_value(value=item) for item in values]
        except redis.RedisError as e:
            print(f"Error getting list range: {e}")
            return []

    def ping(self) -> bool:
        try:
            return bool(self.redis_client.ping())
        except redis.RedisError:
            return False

    def close(self) -> None:
        try:
            self.redis_client.close()
        except Exception:
            pass


_cache_service: Optional[CacheService] = None


def get_cache_service() -> CacheService:
    global _cache_service
    if _cache_service is None:
        redis_url = os.getenv("REDIS_URL")
        _cache_service = CacheService(
            url=redis_url,
            host=os.getenv("REDIS_HOST", "localhost"),
            port=int(os.getenv("REDIS_PORT", 6379)),
            db=int(os.getenv("REDIS_DB", 0)),
            password=_normalize_password(os.getenv("REDIS_PASSWORD")),
        )
    return _cache_service
