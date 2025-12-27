from fastapi import APIRouter, HTTPException
from typing import List
import uuid
from datetime import datetime

from models import Auction, AuctionCreate
from database import auctions_collection

router = APIRouter(prefix="/auctions", tags=["auctions"])

@router.get("/", response_model=List[Auction])
async def get_auctions():
    """Get all auction records"""
    auctions = await auctions_collection.find({}, {"_id": 0}).to_list(None)
    return auctions

@router.get("/{auction_id}", response_model=Auction)
async def get_auction(auction_id: str):
    """Get single auction by ID"""
    auction = await auctions_collection.find_one({"id": auction_id}, {"_id": 0})
    if not auction:
        raise HTTPException(status_code=404, detail="Auction not found")
    return auction

@router.post("/", response_model=Auction)
async def create_auction(auction_data: AuctionCreate):
    """Create new auction record"""
    auction_dict = auction_data.model_dump()
    auction_dict["id"] = str(uuid.uuid4())
    
    # Get current max srNo and increment
    max_auction = await auctions_collection.find_one(
        {},
        sort=[("srNo", -1)]
    )
    auction_dict["srNo"] = (max_auction.get("srNo", 0) + 1) if max_auction else 1
    auction_dict["createdAt"] = datetime.now().isoformat()
    
    await auctions_collection.insert_one(auction_dict)
    return Auction(**auction_dict)

@router.put("/{auction_id}", response_model=Auction)
async def update_auction(auction_id: str, auction_data: AuctionCreate):
    """Update auction record"""
    update_dict = auction_data.model_dump()
    
    result = await auctions_collection.update_one(
        {"id": auction_id},
        {"$set": update_dict}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Auction not found")
    
    auction = await auctions_collection.find_one({"id": auction_id}, {"_id": 0})
    return Auction(**auction)

@router.delete("/{auction_id}")
async def delete_auction(auction_id: str):
    """Delete auction record"""
    result = await auctions_collection.delete_one({"id": auction_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Auction not found")
    
    return {"message": "Auction deleted successfully"}
