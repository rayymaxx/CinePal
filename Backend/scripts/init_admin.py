"""Script to initialize admin user."""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))

from app.services.database import SessionLocal, create_all_tables
from app.services.admin_manager import AdminManager


def initialize_admin():
    """Initialize the admin user."""
    # Create all tables first
    create_all_tables()
    
    db = SessionLocal()
    
    try:
        # Check if admin already exists
        existing = AdminManager.get_admin_by_username(db, "rayymaxx")
        if existing:
            print(f"✓ Admin user 'rayymaxx' already exists")
            print(f"  Last login: {existing.last_login}")
            return
        
        # Create admin user
        admin = AdminManager.create_admin(
            db,
            username="rayymaxx",
            email="admin@cinepal.com",
            password="raymond123?"
        )
        
        print(f"✓ Admin user created successfully!")
        print(f"  Username: {admin.username}")
        print(f"  Email: {admin.email}")
        print(f"  ID: {admin.id}")
        print(f"  Created at: {admin.created_at}")
        
    except ValueError as e:
        print(f"✗ Error: {e}")
    except Exception as e:
        print(f"✗ Unexpected error: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    initialize_admin()
