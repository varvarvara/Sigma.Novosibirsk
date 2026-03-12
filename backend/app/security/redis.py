# import os
# import redis, json
# from sqlalchemy.orm import Session

# from redis import asyncio as aioredis
# from redis.asyncio.client import Redis
# from decouple import config

# from app.modules.attendance.models import Attendance, Achievement
# from app.modules.gamification.models import Gamification, GamificationLevel, ExtracurricularScore, ExtracurricularTeam, ExtracurricularTeamMember, ExtracurricularActivity 

# r = redis.ConnectionPool(host="localhost", port=6379, decode_response=True)
# redis_client = Redis | None = None

# # async def init_redis():
# #     """Initialize Redis connection at app startup"""
# #     global redis
# #     redis = Redis(
# #         host=conf.redis_host,
# #         port=conf.redis_port,
# #         db=conf.redis_db,
# #         password=conf.redis_password,
# #         decode_responses=True,
# #     )

# async def close_redis():
#     """Close Redis connection at app shutdown"""
#     global redis
#     if redis:
#         await redis.close()

# async def get_cache(key: str):
#     if not redis:
#         raise RuntimeError("Redis not initialized. Call init_redis() first.")
#     return await redis.get(key)

# async def set_cache(key: str, value: str, ttl: int = 300):
#     if not redis:
#         raise RuntimeError("Redis not initialized. Call init_redis() first.")
#     await redis.set(key, value, ex=ttl)

# async def delete_cache(key: str):
#     if not redis:
#         raise RuntimeError("Redis not initialized. Call init_redis() first.")
#     await redis.delete(key)

#получит кэщ для пользователя по баллам, чтобы не было постоянного запроса в бд
#проверка, что кэш был
#если нет  - бд

#на сколько сохраняется кэш

#инвалидация

#сумму
