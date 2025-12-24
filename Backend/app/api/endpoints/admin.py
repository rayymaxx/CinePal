"""Admin API endpoints for dashboard and management."""

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from datetime import timedelta
from ...core.auth import create_access_token, decode_access_token
from ...models.pydantic_models import (
    AdminLoginRequest,
    AdminLoginResponse,
    AdminDashboardStats,
    UserActivityRecord,
    APIRequestRecord,
    SystemMetricsRecord
)
from ...services.admin_manager import AdminManager
from ...services.analytics_service import AnalyticsService
from ...services.database import get_db
from typing import List

router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/login", response_model=AdminLoginResponse)
async def admin_login(
    login_data: AdminLoginRequest,
    db: Session = Depends(get_db)
):
    """Admin login endpoint - returns JWT token."""
    admin = AdminManager.authenticate_admin(
        db,
        username=login_data.username,
        password=login_data.password
    )
    
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin credentials"
        )
    
    # Create JWT token
    access_token_expires = timedelta(hours=24)
    access_token = create_access_token(
        data={"sub": str(admin.id), "type": "admin"},
        expires_delta=access_token_expires
    )
    
    return AdminLoginResponse(
        access_token=access_token,
        token_type="bearer",
        username=admin.username
    )


def verify_admin_token(request: Request, db: Session = Depends(get_db)):
    """Verify admin JWT token from request header."""
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authorization header"
        )
    
    token = auth_header.split(" ")[1]
    
    try:
        payload = decode_access_token(token)
        if not payload or payload.get("type") != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not an admin token"
            )
        admin_id = int(payload.get("sub"))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    
    # Verify admin exists and is active
    admin = AdminManager.get_admin_by_id(db, admin_id)
    if not admin or not admin.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin user is not active"
        )
    
    return admin


@router.get("/dashboard/stats", response_model=AdminDashboardStats)
async def get_dashboard_stats(
    admin = Depends(verify_admin_token),
    db: Session = Depends(get_db)
):
    """Get comprehensive dashboard statistics."""
    stats = AnalyticsService.get_dashboard_stats(db)
    return AdminDashboardStats(**stats)


@router.get("/activity/timeline", response_model=List[UserActivityRecord])
async def get_activity_timeline(
    limit: int = 100,
    offset: int = 0,
    admin = Depends(verify_admin_token),
    db: Session = Depends(get_db)
):
    """Get recent user activity timeline."""
    activities = AnalyticsService.get_user_activity_timeline(db, limit=limit, offset=offset)
    return activities


@router.get("/api/performance")
async def get_api_performance(
    hours: int = 24,
    limit: int = 100,
    admin = Depends(verify_admin_token),
    db: Session = Depends(get_db)
):
    """Get API request performance data."""
    performance_data = AnalyticsService.get_api_performance(db, hours=hours, limit=limit)
    return {
        'data': performance_data,
        'total_count': len(performance_data)
    }


@router.get("/metrics/history")
async def get_metrics_history(
    days: int = 30,
    admin = Depends(verify_admin_token),
    db: Session = Depends(get_db)
):
    """Get historical metrics data."""
    metrics = AnalyticsService.get_metrics_history(db, days=days)
    return {
        'metrics': metrics,
        'total_days': len(metrics)
    }


@router.get("/growth")
async def get_user_growth(
    days: int = 30,
    admin = Depends(verify_admin_token),
    db: Session = Depends(get_db)
):
    """Get user growth data."""
    growth_data = AnalyticsService.get_user_growth_data(db, days=days)
    return growth_data


@router.get("/activity/type/{activity_type}")
async def get_activity_count(
    activity_type: str,
    hours: int = 24,
    admin = Depends(verify_admin_token),
    db: Session = Depends(get_db)
):
    """Get count of activities by type."""
    count = AnalyticsService.get_activity_by_type(db, activity_type, hours=hours)
    return {'activity_type': activity_type, 'count': count, 'hours': hours}


@router.post("/health")
async def health_check(admin = Depends(verify_admin_token)):
    """Health check endpoint to verify admin token is valid."""
    return {
        'status': 'healthy',
        'admin_id': admin.id,
        'admin_username': admin.username
    }
