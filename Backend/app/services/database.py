from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from typing import Generator 

db_url = 'sqlite:///data/sqlite.db'

engine = create_engine(
    db_url, 
    echo=True,
    connect_args={"check_same_thread": False}
)

Base = declarative_base()

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine 
)

def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db 
    finally:
        db.close()


def create_all_tables():
    from ..models import database_models
    print(f"Attempting to create tables on {db_url}")
    Base.metadata.create_all(bind=engine)
    print("✅Database tables created successfully.")