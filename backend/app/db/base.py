from sqlite3 import OperationalError

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

SQLALCHEMY_DATABASE_URL = load_dotenv("DATABASE_URL")

engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

try:
    with engine.connect() as connection:
        print("Подключение к базе данных успешно!")
except OperationalError as e:
    print("Ошибка подключения:", e)

def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()