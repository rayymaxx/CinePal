"""Analytics and activity tracking service."""

from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from ..models.database_models import (
    UserActivity,
    APIRequest,
    SystemMetrics,
    User
)


class AnalyticsService:
    """Handles activity tracking and analytics data collection."""

    @staticmethod
    def record_activity(
        db: Session,
        activity_type: str,
        user_id: Optional[int] = None,
        session_id: Optional[str] = None,
        ip_address: Optional[str] = None,
        activity_data: Optional[Dict[str, Any]] = None
    ) -> UserActivity:
        """Record a user activity event."""
        activity = UserActivity(
            user_id=user_id,
            activity_type=activity_type,
            session_id=session_id,
            ip_address=ip_address,
            activity_data=activity_data,
            timestamp=datetime.utcnow()
        )
        db.add(activity)
        db.commit()
        db.refresh(activity)
        return activity

    @staticmethod
    def record_api_request(
        db: Session,
        endpoint: str,
        method: str,
        status_code: int,
        response_time_ms: float,
        user_id: Optional[int] = None,
        admin_id: Optional[int] = None,
        error_message: Optional[str] = None
    ) -> APIRequest:
        """Record an API request for performance tracking."""
        api_request = APIRequest(
            endpoint=endpoint,
            method=method,
            status_code=status_code,
            response_time_ms=response_time_ms,
            user_id=user_id,
            admin_id=admin_id,
            error_message=error_message,
            timestamp=datetime.utcnow()
        )
        db.add(api_request)
        db.commit()
        db.refresh(api_request)
        return api_request

    @staticmethod
    def get_dashboard_stats(db: Session) -> Dict[str, Any]:
        """Get comprehensive dashboard statistics."""
        now = datetime.utcnow()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        
        # Total users
        total_users = db.query(func.count(User.id)).scalar() or 0
        
        # Active users today (users who had any activity today)
        active_users_today = db.query(func.count(func.distinct(UserActivity.user_id))).filter(
            UserActivity.timestamp >= today_start,
            UserActivity.user_id.isnot(None)
        ).scalar() or 0
        
        # Total chat requests
        total_chat_requests = db.query(func.count(UserActivity.id)).filter(
            UserActivity.activity_type == 'chat'
        ).scalar() or 0
        
        # Total API requests
        total_api_requests = db.query(func.count(APIRequest.id)).scalar() or 0
        
        # Average response time
        avg_response_time = db.query(func.avg(APIRequest.response_time_ms)).scalar() or 0
        
        # Total recommendations (chat activities)
        total_recommendations = db.query(func.count(UserActivity.id)).filter(
            UserActivity.activity_type == 'recommendation_viewed'
        ).scalar() or 0
        
        # Error count (non-2xx/3xx status codes)
        error_count = db.query(func.count(APIRequest.id)).filter(
            APIRequest.status_code >= 400
        ).scalar() or 0
        
        return {
            'total_users': total_users,
            'active_users_today': active_users_today,
            'total_chat_requests': total_chat_requests,
            'total_api_requests': total_api_requests,
            'avg_response_time_ms': round(float(avg_response_time), 2),
            'total_recommendations': total_recommendations,
            'error_count': error_count,
            'peak_concurrent_users': 0  # Would need real-time tracking
        }

    @staticmethod
    def get_user_activity_timeline(
        db: Session,
        limit: int = 100,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        """Get recent user activity timeline."""
        activities = db.query(UserActivity).order_by(
            UserActivity.timestamp.desc()
        ).limit(limit).offset(offset).all()
        
        return [
            {
                'id': a.id,
                'user_id': a.user_id,
                'activity_type': a.activity_type,
                'timestamp': a.timestamp.isoformat(),
                'session_id': a.session_id,
                'activity_data': a.activity_data
            }
            for a in activities
        ]

    @staticmethod
    def get_api_performance(
        db: Session,
        hours: int = 24,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """Get API request performance data."""
        cutoff_time = datetime.utcnow() - timedelta(hours=hours)
        
        requests = db.query(APIRequest).filter(
            APIRequest.timestamp >= cutoff_time
        ).order_by(APIRequest.timestamp.desc()).limit(limit).all()
        
        return [
            {
                'id': r.id,
                'endpoint': r.endpoint,
                'method': r.method,
                'status_code': r.status_code,
                'response_time_ms': r.response_time_ms,
                'user_id': r.user_id,
                'timestamp': r.timestamp.isoformat(),
                'error_message': r.error_message
            }
            for r in requests
        ]

    @staticmethod
    def get_activity_by_type(
        db: Session,
        activity_type: str,
        hours: int = 24
    ) -> int:
        """Get count of activities by type in the last N hours."""
        cutoff_time = datetime.utcnow() - timedelta(hours=hours)
        
        count = db.query(func.count(UserActivity.id)).filter(
            UserActivity.activity_type == activity_type,
            UserActivity.timestamp >= cutoff_time
        ).scalar() or 0
        
        return count

    @staticmethod
    def record_daily_metrics(db: Session) -> SystemMetrics:
        """Record daily aggregated metrics."""
        stats = AnalyticsService.get_dashboard_stats(db)
        
        metrics = SystemMetrics(
            metric_date=datetime.utcnow(),
            total_users=stats['total_users'],
            active_users_today=stats['active_users_today'],
            total_chat_requests=stats['total_chat_requests'],
            total_api_requests=stats['total_api_requests'],
            avg_response_time_ms=stats['avg_response_time_ms'],
            total_recommendations_given=stats['total_recommendations'],
            error_count=stats['error_count']
        )
        
        db.add(metrics)
        db.commit()
        db.refresh(metrics)
        return metrics

    @staticmethod
    def get_metrics_history(
        db: Session,
        days: int = 30
    ) -> List[Dict[str, Any]]:
        """Get historical metrics for the last N days."""
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        metrics = db.query(SystemMetrics).filter(
            SystemMetrics.metric_date >= cutoff_date
        ).order_by(SystemMetrics.metric_date.asc()).all()
        
        return [
            {
                'metric_date': m.metric_date.isoformat(),
                'total_users': m.total_users,
                'active_users_today': m.active_users_today,
                'total_chat_requests': m.total_chat_requests,
                'total_api_requests': m.total_api_requests,
                'avg_response_time_ms': m.avg_response_time_ms,
                'total_recommendations_given': m.total_recommendations_given,
                'error_count': m.error_count
            }
            for m in metrics
        ]

    @staticmethod
    def get_user_growth_data(db: Session, days: int = 30) -> Dict[str, Any]:
        """Get user growth metrics over time."""
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        daily_user_counts = db.query(
            func.date(User.created_at),
            func.count(User.id)
        ).filter(
            User.created_at >= cutoff_date
        ).group_by(
            func.date(User.created_at)
        ).order_by(
            func.date(User.created_at)
        ).all()
        
        return {
            'daily_signups': [
                {
                    'date': str(date),
                    'count': count
                }
                for date, count in daily_user_counts
            ]
        }
