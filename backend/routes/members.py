from fastapi import APIRouter, HTTPException
from typing import List
import uuid
from datetime import datetime

from models import Member, MemberCreate, MemberUpdate, BCTransfer, PendingEdit
from database import members_collection, groups_collection
from utils import calculate_pending, recalc_group

router = APIRouter(prefix="/members", tags=["members"])

@router.get("/", response_model=List[Member])
async def get_members():
    """Get all members"""
    members = await members_collection.find({}, {"_id": 0}).to_list(None)
    return members

@router.get("/group/{group_id}", response_model=List[Member])
async def get_members_by_group(group_id: str):
    """Get all members of a specific group"""
    members = await members_collection.find({"groupId": group_id}, {"_id": 0}).to_list(None)
    return members

@router.get("/{member_id}", response_model=Member)
async def get_member(member_id: str):
    """Get single member by ID"""
    member = await members_collection.find_one({"id": member_id}, {"_id": 0})
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    return member

@router.post("/", response_model=Member)
async def create_member(member_data: MemberCreate):
    """Create new member"""
    # Check if group exists
    group = await groups_collection.find_one({"id": member_data.groupId})
    if not group:
        raise HTTPException(status_code=400, detail="Invalid group")
    
    member_dict = member_data.model_dump()
    member_dict["id"] = str(uuid.uuid4())
    member_dict["bcHistory"] = []
    member_dict["emiPaidCount"] = 0
    member_dict["joinDate"] = member_dict["joinDate"].isoformat() if isinstance(member_dict["joinDate"], datetime) else member_dict["joinDate"]
    
    # Calculate initial pending amount
    emi_amount = group.get("emiAmount", 0)
    join_date = datetime.fromisoformat(member_dict["joinDate"])
    member_dict["pendingAmount"] = calculate_pending(join_date, emi_amount, 0)
    member_dict["manualPendingOverride"] = False
    member_dict["createdAt"] = datetime.now().isoformat()
    member_dict["updatedAt"] = datetime.now().isoformat()
    
    await members_collection.insert_one(member_dict)
    await recalc_group(member_data.groupId, groups_collection, members_collection)
    
    return Member(**member_dict)

@router.put("/{member_id}", response_model=Member)
async def update_member(member_id: str, member_data: MemberUpdate):
    """Update member basic details"""
    member = await members_collection.find_one({"id": member_id})
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    
    update_dict = {k: v for k, v in member_data.model_dump().items() if v is not None}
    update_dict["updatedAt"] = datetime.now().isoformat()
    
    # Recalculate pending if not manually overridden
    if not member.get("manualPendingOverride", False):
        group = await groups_collection.find_one({"id": member["groupId"]})
        join_date = datetime.fromisoformat(member["joinDate"])
        emi_amount = group.get("emiAmount", 0) if group else 0
        update_dict["pendingAmount"] = calculate_pending(join_date, emi_amount, member.get("emiPaidCount", 0))
    
    await members_collection.update_one(
        {"id": member_id},
        {"$set": update_dict}
    )
    
    updated_member = await members_collection.find_one({"id": member_id}, {"_id": 0})
    return Member(**updated_member)

@router.delete("/{member_id}")
async def delete_member(member_id: str):
    """Delete member"""
    member = await members_collection.find_one({"id": member_id})
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    
    group_id = member["groupId"]
    
    result = await members_collection.delete_one({"id": member_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Member not found")
    
    await recalc_group(group_id, groups_collection, members_collection)
    
    return {"message": "Member deleted successfully"}

@router.post("/transfer-bc", response_model=Member)
async def transfer_bc(transfer_data: BCTransfer):
    """Transfer member to new BC"""
    member = await members_collection.find_one({"id": transfer_data.memberId})
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    
    # Add to BC history
    bc_history = member.get("bcHistory", [])
    bc_history.append({
        "bcName": member["bcHolder"],
        "transferredAt": transfer_data.transferDate.isoformat()
    })
    
    await members_collection.update_one(
        {"id": transfer_data.memberId},
        {
            "$set": {
                "bcHolder": transfer_data.newBc,
                "bcHistory": bc_history,
                "updatedAt": datetime.now().isoformat()
            }
        }
    )
    
    updated_member = await members_collection.find_one({"id": transfer_data.memberId}, {"_id": 0})
    return Member(**updated_member)

@router.post("/edit-pending", response_model=Member)
async def edit_pending(pending_data: PendingEdit):
    """Manually edit pending amount"""
    member = await members_collection.find_one({"id": pending_data.memberId})
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    
    await members_collection.update_one(
        {"id": pending_data.memberId},
        {
            "$set": {
                "pendingAmount": pending_data.pendingAmount,
                "manualPendingOverride": True,
                "updatedAt": datetime.now().isoformat()
            }
        }
    )
    
    updated_member = await members_collection.find_one({"id": pending_data.memberId}, {"_id": 0})
    return Member(**updated_member)
