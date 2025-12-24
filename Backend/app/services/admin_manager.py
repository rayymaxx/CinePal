"""Admin user management and authentication service."""

from sqlalchemy.orm import Session
from ..models.database_models import AdminUser
from ..core.auth import get_password_hash, verify_password
from ..models.pydantic_models import AdminLoginRequest, AdminLoginResponse
from datetime import datetime
from typing import Optional


class AdminManager:
    """Manages admin user authentication and operations."""

    @staticmethod
    def create_admin(db: Session, username: str, email: str, password: str) -> AdminUser:
        """Create a new admin user."""
        # Check if admin already exists
        existing_admin = db.query(AdminUser).filter(
            (AdminUser.username == username) | (AdminUser.email == email)
        ).first()
        
        if existing_admin:
            raise ValueError("Admin user already exists")
        
        hashed_password = get_password_hash(password)
        admin = AdminUser(
            username=username,
            email=email,
            hashed_password=hashed_password,
            is_active=True
        )
        
        db.add(admin)
        db.commit()
        db.refresh(admin)
        return admin

    @staticmethod
    def authenticate_admin(db: Session, username: str, password: str) -> Optional[AdminUser]:
        """Authenticate an admin user."""
        admin = db.query(AdminUser).filter(AdminUser.username == username).first()
        
        if not admin:
            return None
        
        if not admin.is_active:
            return None
        
        if not verify_password(password, admin.hashed_password):
            return None
        
        # Update last login
        admin.last_login = datetime.utcnow()
        db.commit()
        
        return admin

    @staticmethod
    def get_admin_by_id(db: Session, admin_id: int) -> Optional[AdminUser]:
        """Get admin user by ID."""
        return db.query(AdminUser).filter(AdminUser.id == admin_id).first()

    @staticmethod
    def get_admin_by_username(db: Session, username: str) -> Optional[AdminUser]:
        """Get admin user by username."""
        return db.query(AdminUser).filter(AdminUser.username == username).first()

    @staticmethod
    def deactivate_admin(db: Session, admin_id: int) -> bool:
        """Deactivate an admin user."""
        admin = db.query(AdminUser).filter(AdminUser.id == admin_id).first()
        if not admin:
            return False
        
        admin.is_active = False
        db.commit()
        return True
