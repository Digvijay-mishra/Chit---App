from fastapi import APIRouter
from datetime import datetime, timedelta

from models import DashboardStats
from database import groups_collection, members_collection, payments_collection

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/stats", response_model=DashboardStats)
@router.get("/stats/", response_model=DashboardStats, include_in_schema=False)
async def get_dashboard_stats():
    """Get dashboard statistics with accurate calculations"""
    try:
        # Groups stats
        all_groups = await groups_collection.find({}).to_list(None)
        total_groups = len(all_groups)
        active_groups = len([g for g in all_groups if g.get('membersCount', 0) > 0])
        closed_groups = total_groups - active_groups
        
        # Members stats
        all_members = await members_collection.find({}).to_list(None)
        total_members = len(all_members)
        active_members = len([m for m in all_members if m.get("status") == "active"])
        inactive_members = total_members - active_members
        
        # Payment stats
        all_payments = await payments_collection.find({}).to_list(None)
        total_collection = sum(p.get("amount", 0) for p in all_payments)
        
        # Monthly collection (last 30 days)
        thirty_days_ago = datetime.now() - timedelta(days=30)
        monthly_collection = 0
        for p in all_payments:
            try:
                payment_date = datetime.fromisoformat(p.get("paymentDate", ""))
                if payment_date > thirty_days_ago:
                    monthly_collection += p.get("amount", 0)
            except:
                continue
        
        # Pending stats - sum all pending amounts
        total_pending = 0
        overdue_pending = 0
        
        for member in all_members:
            pending = member.get("pendingAmount", 0)
            total_pending += pending
            
            # Check if overdue (more than 2 EMIs pending)
            group = next((g for g in all_groups if g.get("id") == member.get("groupId")), None)
            if group and pending > (group.get("emiAmount", 0) * 2):
                overdue_pending += pending
        
        return DashboardStats(
            totalGroups=total_groups,
            activeGroups=active_groups,
            closedGroups=closed_groups,
            totalMembers=total_members,
            activeMembers=active_members,
            inactiveMembers=inactive_members,
            totalCollection=total_collection,
            monthlyCollection=monthly_collection,
            totalPending=total_pending,
            overduePending=overdue_pending
        )
    except Exception as e:
        print(f"Error calculating dashboard stats: {e}")
        import traceback
        traceback.print_exc()
        # Return zeros if error
        return DashboardStats(
            totalGroups=0,
            activeGroups=0,
            closedGroups=0,
            totalMembers=0,
            activeMembers=0,
            inactiveMembers=0,
            totalCollection=0,
            monthlyCollection=0,
            totalPending=0,
            overduePending=0
        )
