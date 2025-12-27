from fastapi import APIRouter, HTTPException
from typing import List
import uuid
from datetime import datetime

from models import Payment, PaymentCreate
from database import payments_collection, members_collection, groups_collection
from utils import calculate_pending

router = APIRouter(prefix="/payments", tags=["payments"])

@router.get("/", response_model=List[Payment])
async def get_payments():
    """Get all payments"""
    payments = await payments_collection.find({}, {"_id": 0}).to_list(None)
    return payments

@router.get("/member/{member_id}", response_model=List[Payment])
async def get_member_payments(member_id: str):
    """Get all payments for a member"""
    payments = await payments_collection.find({"memberId": member_id}, {"_id": 0}).to_list(None)
    return payments

@router.post("/", response_model=Payment)
async def create_payment(payment_data: PaymentCreate):
    """Record new payment"""
    payment_dict = payment_data.model_dump()
    payment_dict["id"] = str(uuid.uuid4())
    payment_dict["paymentDate"] = datetime.now().isoformat()
    
    await payments_collection.insert_one(payment_dict)
    
    # Update member's paid count and recalculate pending
    member = await members_collection.find_one({"id": payment_data.memberId})
    if member:
        new_emi_paid = member.get("emiPaidCount", 0) + 1
        
        update_data = {
            "emiPaidCount": new_emi_paid,
            "updatedAt": datetime.now().isoformat()
        }
        
        # Only recalc pending if not manually overridden
        if not member.get("manualPendingOverride", False):
            group = await groups_collection.find_one({"id": member["groupId"]})
            if group:
                join_date = datetime.fromisoformat(member["joinDate"])
                update_data["pendingAmount"] = calculate_pending(
                    join_date,
                    group.get("emiAmount", 0),
                    new_emi_paid
                )
        
        await members_collection.update_one(
            {"id": payment_data.memberId},
            {"$set": update_data}
        )
    
    return Payment(**payment_dict)

@router.delete("/{payment_id}")
async def delete_payment(payment_id: str):
    """Delete payment record"""
    payment = await payments_collection.find_one({"id": payment_id})
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    member_id = payment["memberId"]
    
    result = await payments_collection.delete_one({"id": payment_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    # Update member's paid count
    member = await members_collection.find_one({"id": member_id})
    if member and member.get("emiPaidCount", 0) > 0:
        new_emi_paid = member.get("emiPaidCount", 0) - 1
        
        update_data = {
            "emiPaidCount": new_emi_paid,
            "updatedAt": datetime.now().isoformat()
        }
        
        # Recalc pending if not manually overridden
        if not member.get("manualPendingOverride", False):
            group = await groups_collection.find_one({"id": member["groupId"]})
            if group:
                join_date = datetime.fromisoformat(member["joinDate"])
                update_data["pendingAmount"] = calculate_pending(
                    join_date,
                    group.get("emiAmount", 0),
                    new_emi_paid
                )
        
        await members_collection.update_one(
            {"id": member_id},
            {"$set": update_data}
        )
    
    return {"message": "Payment deleted successfully"}
