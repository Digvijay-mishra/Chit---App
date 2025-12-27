from fastapi import APIRouter, HTTPException
from typing import List
import uuid
from datetime import datetime

from models import Group, GroupCreate, GroupUpdate
from database import groups_collection, members_collection
from utils import recalc_group

router = APIRouter(prefix="/groups", tags=["groups"])

@router.get("/", response_model=List[Group])
async def get_groups():
    """Get all groups"""
    groups = await groups_collection.find({}, {"_id": 0}).to_list(None)
    return groups

@router.get("/{group_id}", response_model=Group)
async def get_group(group_id: str):
    """Get single group by ID"""
    group = await groups_collection.find_one({"id": group_id}, {"_id": 0})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    return group

@router.post("/", response_model=Group)
async def create_group(group_data: GroupCreate):
    """Create new group"""
    group_dict = group_data.model_dump()
    group_dict["id"] = str(uuid.uuid4())
    group_dict["emiAmount"] = 0
    group_dict["membersCount"] = 0
    group_dict["vacancies"] = group_data.maxMembers
    group_dict["createdAt"] = datetime.now().isoformat()
    
    await groups_collection.insert_one(group_dict)
    return Group(**group_dict)

@router.put("/{group_id}", response_model=Group)
async def update_group(group_id: str, group_data: GroupUpdate):
    """Update group"""
    update_dict = {k: v for k, v in group_data.model_dump().items() if v is not None}
    
    if not update_dict:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    result = await groups_collection.update_one(
        {"id": group_id},
        {"$set": update_dict}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Group not found")
    
    # Recalculate if totalChitAmount changed
    if "totalChitAmount" in update_dict:
        await recalc_group(group_id, groups_collection, members_collection)
    
    group = await groups_collection.find_one({"id": group_id}, {"_id": 0})
    return Group(**group)

@router.delete("/{group_id}")
async def delete_group(group_id: str):
    """Delete group and all its members"""
    try:
        # Check if group exists
        group = await groups_collection.find_one({"id": group_id})
        if not group:
            raise HTTPException(status_code=404, detail="Group not found")
        
        # Delete the group
        result = await groups_collection.delete_one({"id": group_id})
        
        # Delete all members of this group
        await members_collection.delete_many({"groupId": group_id})
        
        return {"message": "Group deleted successfully", "deleted": True}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting group: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to delete group: {str(e)}")
