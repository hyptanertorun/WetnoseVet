from typing import Optional, List, Tuple, Dict, Any, Union
from datetime import datetime, timezone

from db.mongodb import get_database
from models.audit import AuditLog, AuditAction
import logging

logger = logging.getLogger(__name__)

class AuditService:
    @staticmethod
    async def log(
        entity_type: str,
        action: Union[AuditAction, str],
        actor_user_id: Optional[str] = None,
        actor_email: Optional[str] = None,
        actor_role: Optional[str] = None,
        entity_id: Optional[str] = None,
        before_state: Optional[Dict[str, Any]] = None,
        after_state: Optional[Dict[str, Any]] = None,
        metadata: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        success: bool = True,
        error_message: Optional[str] = None
    ) -> AuditLog:
        """Create an audit log entry"""
        db = get_database()
        
        # Convert string action to enum if needed
        if isinstance(action, str):
            try:
                action = AuditAction(action)
            except ValueError:
                # Use UPDATE as default for unknown actions
                action = AuditAction.UPDATE
        
        # Remove sensitive data from states
        if before_state:
            before_state = AuditService._sanitize_state(before_state)
        if after_state:
            after_state = AuditService._sanitize_state(after_state)
        
        audit_log = AuditLog(
            actor_user_id=actor_user_id,
            actor_email=actor_email,
            actor_role=actor_role,
            entity_type=entity_type,
            entity_id=entity_id,
            action=action,
            before_state=before_state,
            after_state=after_state,
            metadata=metadata,
            ip_address=ip_address,
            user_agent=user_agent,
            success=success,
            error_message=error_message
        )
        
        doc = audit_log.model_dump()
        doc['timestamp'] = doc['timestamp'].isoformat()
        doc['action'] = doc['action'].value if hasattr(doc['action'], 'value') else doc['action']
        
        await db.audit_logs.insert_one(doc)
        action_str = action.value if hasattr(action, 'value') else action
        logger.info(f"Audit: {action_str} on {entity_type}/{entity_id} by {actor_email}")
        
        return audit_log
    
    @staticmethod
    def _sanitize_state(state: Dict[str, Any]) -> Dict[str, Any]:
        """Remove sensitive fields from state"""
        sensitive_fields = ['password', 'password_hash', 'token', 'refresh_token', 'access_token']
        sanitized = {}
        for key, value in state.items():
            if key.lower() in sensitive_fields:
                sanitized[key] = '[REDACTED]'
            elif isinstance(value, dict):
                sanitized[key] = AuditService._sanitize_state(value)
            else:
                sanitized[key] = value
        return sanitized
    
    @staticmethod
    async def get_logs(
        page: int = 1,
        page_size: int = 50,
        entity_type: Optional[str] = None,
        action: Optional[AuditAction] = None,
        actor_user_id: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> Tuple[List[AuditLog], int]:
        """Get paginated audit logs"""
        db = get_database()
        
        # Build query
        query = {}
        if entity_type:
            query["entity_type"] = entity_type
        if action:
            query["action"] = action.value
        if actor_user_id:
            query["actor_user_id"] = actor_user_id
        if start_date or end_date:
            query["timestamp"] = {}
            if start_date:
                query["timestamp"]["$gte"] = start_date.isoformat()
            if end_date:
                query["timestamp"]["$lte"] = end_date.isoformat()
        
        # Get total count
        total = await db.audit_logs.count_documents(query)
        
        # Get logs with pagination
        skip = (page - 1) * page_size
        cursor = db.audit_logs.find(query, {"_id": 0}).skip(skip).limit(page_size).sort("timestamp", -1)
        logs_docs = await cursor.to_list(page_size)
        
        logs = []
        for doc in logs_docs:
            if doc.get('timestamp') and isinstance(doc['timestamp'], str):
                doc['timestamp'] = datetime.fromisoformat(doc['timestamp'])
            if doc.get('action') and isinstance(doc['action'], str):
                doc['action'] = AuditAction(doc['action'])
            logs.append(AuditLog(**doc))
        
        return logs, total
