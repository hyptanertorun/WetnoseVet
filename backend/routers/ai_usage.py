"""
AI Usage Statistics Endpoint
Tracks image generation, blog generation, and revision usage
"""

from fastapi import APIRouter, Depends
from middleware.auth import get_current_active_user
from middleware.rbac import require_admin_manager
from db.mongodb import get_database
from datetime import datetime, timedelta, timezone
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/admin/ai-usage", tags=["AI Usage"])

# Cost estimates per operation (USD)
COST_ESTIMATES = {
    "image_generation": 0.05,  # ~$0.04-0.08 per image
    "blog_generation": 0.03,   # ~$0.01-0.05 per blog
    "revision": 0.02           # ~$0.01-0.03 per revision
}


@router.get("")
async def get_ai_usage_stats(
    current_user = Depends(require_admin_manager)
):
    """
    Get AI usage statistics from audit logs
    """
    db = get_database()
    
    # Calculate date range
    now = datetime.now(timezone.utc)
    seven_days_ago = now - timedelta(days=7)
    
    # Query audit logs for AI operations
    pipeline_total = [
        {
            "$match": {
                "entity_type": {"$in": ["ai_image", "ai_blog", "ai_revision"]},
                "action": {"$in": ["generate", "create", "revise"]}
            }
        },
        {
            "$group": {
                "_id": "$entity_type",
                "count": {"$sum": 1}
            }
        }
    ]
    
    pipeline_last_7_days = [
        {
            "$match": {
                "entity_type": {"$in": ["ai_image", "ai_blog", "ai_revision"]},
                "action": {"$in": ["generate", "create", "revise"]},
                "created_at": {"$gte": seven_days_ago}
            }
        },
        {
            "$group": {
                "_id": "$entity_type",
                "count": {"$sum": 1}
            }
        }
    ]
    
    try:
        total_results = await db.audit_logs.aggregate(pipeline_total).to_list(None)
        recent_results = await db.audit_logs.aggregate(pipeline_last_7_days).to_list(None)
    except Exception as e:
        logger.error(f"Error fetching AI usage stats: {e}")
        total_results = []
        recent_results = []
    
    # Parse results
    def parse_results(results):
        parsed = {
            "image_generations": 0,
            "blog_generations": 0,
            "revisions": 0
        }
        for r in results:
            if r["_id"] == "ai_image":
                parsed["image_generations"] = r["count"]
            elif r["_id"] == "ai_blog":
                parsed["blog_generations"] = r["count"]
            elif r["_id"] == "ai_revision":
                parsed["revisions"] = r["count"]
        return parsed
    
    total = parse_results(total_results)
    recent = parse_results(recent_results)
    
    # Calculate estimated cost
    estimated_cost = (
        total["image_generations"] * COST_ESTIMATES["image_generation"] +
        total["blog_generations"] * COST_ESTIMATES["blog_generation"] +
        total["revisions"] * COST_ESTIMATES["revision"]
    )
    
    return {
        "total_image_generations": total["image_generations"],
        "total_blog_generations": total["blog_generations"],
        "total_revisions": total["revisions"],
        "last_7_days": {
            "image_generations": recent["image_generations"],
            "blog_generations": recent["blog_generations"],
            "revisions": recent["revisions"]
        },
        "estimated_cost_usd": round(estimated_cost, 2)
    }
