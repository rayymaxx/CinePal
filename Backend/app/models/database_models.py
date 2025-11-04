from sqlalchemy import create_engine, Column, Integer, String, DateTime, Boolean, Text, ForeignKey, JSON, Float
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime

db_url = 'sqlite:///Backend/data/sqlite.db'

engine = create_engine(db_url, echo=True)

Base = declarative_base()

# CORE USER MANAGEMENT MODELS
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    user_name = Column(String, unique=True, index=True, nullable=False)
    user_email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)

    preferences = relationship('UserPreference', back_populates='user') 
    interactions = relationship('InteractionHistory', back_populates='user')


class UserPreference(Base):
    __tablename__ = "user_preferences"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    preference_type = Column(String) #e.g., 'genre', 'actor', 'mood'
    preference_value = Column(String) # e.g., 'sci-fi', 'Tom Hanks', 'dark
    score = Column(Float)
    last_updated = Column(DateTime, default=datetime.utcnow)

    user = relationship('User', back_populates='preferences')


# CONVERSATION AND LEARNING MODELS 
class InteractionHistory(Base):
    __tablename__ = "interaction_history"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id')) 
    user_message = Column(Text)
    ai_response = Column(Text) 
    session_id = Column(String) # to group messages from the same conversation 
    timestamp = Column(DateTime, default=datetime.utcnow) 

    user = relationship('User', back_populates='interactions')
    recommended_shows = relationship('InteractionShowJunction', back_populates='interaction')


class InteractionShowJunction(Base):
    __tablename__ = "interaction_show_junction"

    id = Column(Integer, primary_key=True)
    interaction_id = Column(Integer, ForeignKey('interaction_history.id'))
    show_id = Column(Integer, ForeignKey('cached_show.show_id')) 
    show_title = Column(String) 

    interaction = relationship('InteractionHistory', back_populates='recommended_shows')


# SHOW METADATA AND CACHE MODEL 
class CachedShow(Base):
    __tablename__ = "cached_show"

    show_id = Column(Integer, primary_key=True)
    title = Column(String) 
    type = Column(String) 
    genres = Column(JSON)
    plot = Column(Text) 
    release_date = Column(DateTime) 
    runtime = Column(String) 
    cast = Column(JSON) 
    directors = Column(JSON) 
    poster_url = Column(String) 
    tmdb_rating = Column(Float) 
    last_updated = Column(DateTime, default=datetime.utcnow) 

