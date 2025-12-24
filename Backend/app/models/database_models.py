from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey, JSON, Float
from sqlalchemy.orm import relationship
from ..services.database import Base
from datetime import datetime

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
    interactions = relationship('InteractionHistoryInDB', back_populates='user')


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
class InteractionHistoryInDB(Base):
    __tablename__ = "interaction_history"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id')) 
    user_message = Column(Text)
    ai_response = Column(Text) 
    session_id = Column(String) # to group messages from the same conversation 
    timestamp = Column(DateTime, default=datetime.utcnow) 

    user = relationship('User', back_populates='interactions')
    recommended_shows = relationship('InteractionShowJunctionInDB', back_populates='interaction')


class InteractionShowJunctionInDB(Base):
    __tablename__ = "interaction_show_junction"

    id = Column(Integer, primary_key=True)
    interaction_id = Column(Integer, ForeignKey('interaction_history.id'))
    show_id = Column(Integer, ForeignKey('cached_show.show_id')) 
    show_title = Column(String) 

    interaction = relationship('InteractionHistoryInDB', back_populates='recommended_shows')


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


# ADMIN AND ANALYTICS MODELS
class AdminUser(Base):
    __tablename__ = "admin_users"

    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)
    
    # Relationships
    api_requests = relationship('APIRequest', back_populates='created_by')


class UserActivity(Base):
    __tablename__ = "user_activity"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=True)  # nullable for guest tracking
    activity_type = Column(String, index=True)  # 'login', 'chat', 'recommendation_viewed', 'movie_searched'
    activity_data = Column(JSON, nullable=True)  # Additional context about the activity
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    session_id = Column(String, index=True, nullable=True)
    ip_address = Column(String, nullable=True)
    
    user = relationship('User')


class APIRequest(Base):
    __tablename__ = "api_requests"

    id = Column(Integer, primary_key=True)
    endpoint = Column(String, index=True)
    method = Column(String)  # 'GET', 'POST', 'PUT', 'DELETE'
    status_code = Column(Integer)
    response_time_ms = Column(Float)  # Response time in milliseconds
    user_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    admin_id = Column(Integer, ForeignKey('admin_users.id'), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    error_message = Column(Text, nullable=True)
    
    user = relationship('User')
    created_by = relationship('AdminUser', back_populates='api_requests')


class SystemMetrics(Base):
    __tablename__ = "system_metrics"

    id = Column(Integer, primary_key=True)
    metric_date = Column(DateTime, default=datetime.utcnow, index=True)  # Aggregation date
    total_users = Column(Integer, default=0)
    active_users_today = Column(Integer, default=0)
    total_chat_requests = Column(Integer, default=0)
    total_api_requests = Column(Integer, default=0)
    avg_response_time_ms = Column(Float, default=0)
    total_recommendations_given = Column(Integer, default=0)
    tmdb_api_calls = Column(Integer, default=0)
    serper_api_calls = Column(Integer, default=0)
    error_count = Column(Integer, default=0)
    
    # Performance metrics
    peak_concurrent_users = Column(Integer, default=0)
    avg_session_duration_minutes = Column(Float, default=0) 

