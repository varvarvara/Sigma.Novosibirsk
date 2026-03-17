import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")
if not SQLALCHEMY_DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not configured")

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={}, future=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, expire_on_commit=False, future = True)
Base = declarative_base()