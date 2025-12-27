from datetime import datetime, timedelta
from typing import Optional

def calculate_pending(join_date: datetime, emi_amount: float, emi_paid: int) -> float:
    """Calculate pending EMI amount till current month"""
    if not join_date or not emi_amount:
        return 0
    
    now = datetime.now()
    months = (now.year - join_date.year) * 12 + (now.month - join_date.month) + 1
    
    total_due = months * emi_amount
    paid = emi_paid * emi_amount
    
    return max(total_due - paid, 0)

async def recalc_group(group_id: str, groups_collection, members_collection):
    """Recalculate group EMI and counts"""
    members = await members_collection.find({"groupId": group_id}).to_list(None)
    active_members = [m for m in members if m.get("status") == "active"]
    
    group = await groups_collection.find_one({"id": group_id})
    if not group:
        return
    
    members_count = len(active_members)
    total_chit = group.get("totalChitAmount", 0)
    emi_amount = round(total_chit / members_count) if members_count > 0 else 0
    vacancies = group.get("maxMembers", 0) - members_count
    
    await groups_collection.update_one(
        {"id": group_id},
        {
            "$set": {
                "membersCount": members_count,
                "emiAmount": emi_amount,
                "vacancies": vacancies
            }
        }
    )

def format_date_display(date_str: str) -> str:
    """Format date for display (DD-MM-YYYY)"""
    try:
        dt = datetime.fromisoformat(date_str)
        return dt.strftime("%d-%m-%Y")
    except:
        return date_str

def get_due_date(months_ahead: int = 1) -> datetime:
    """Get future due date"""
    now = datetime.now()
    return now + timedelta(days=30 * months_ahead)
