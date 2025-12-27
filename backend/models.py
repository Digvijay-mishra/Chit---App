from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime
from enum import Enum

class MemberStatus(str, Enum):
    active = "active"
    inactive = "inactive"

class PaymentType(str, Enum):
    COLLECTION = "COLLECTION"
    BC_GIVEN = "BC_GIVEN"

class AuctionStatus(str, Enum):
    Prized = "Prized"
    NonPrized = "Non-Prx"

# Group Models
class GroupBase(BaseModel):
    name: str
    totalChitAmount: float
    maxMembers: int
    description: Optional[str] = ""

class GroupCreate(GroupBase):
    pass

class GroupUpdate(BaseModel):
    name: Optional[str] = None
    totalChitAmount: Optional[float] = None
    maxMembers: Optional[int] = None
    description: Optional[str] = None

class Group(GroupBase):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    emiAmount: float = 0
    membersCount: int = 0
    vacancies: int = 0
    createdAt: datetime = Field(default_factory=datetime.now)

# Member Models
class BCHistory(BaseModel):
    bcName: str
    transferredAt: datetime = Field(default_factory=datetime.now)

class MemberBase(BaseModel):
    name: str
    phone: str
    email: Optional[str] = ""
    address: Optional[str] = ""
    groupId: str
    bcHolder: str
    joinDate: datetime
    endDate: Optional[datetime] = None
    status: MemberStatus = MemberStatus.active

class MemberCreate(MemberBase):
    pass

class MemberUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    bcHolder: Optional[str] = None
    status: Optional[MemberStatus] = None

class Member(MemberBase):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    bcHistory: List[BCHistory] = []
    emiPaidCount: int = 0
    pendingAmount: float = 0
    manualPendingOverride: bool = False
    createdAt: datetime = Field(default_factory=datetime.now)
    updatedAt: datetime = Field(default_factory=datetime.now)

# Payment Models
class PaymentBase(BaseModel):
    groupId: str
    memberId: str
    amount: float
    emiNo: int
    paidBy: str
    type: PaymentType = PaymentType.COLLECTION

class PaymentCreate(PaymentBase):
    pass

class Payment(PaymentBase):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    paymentDate: datetime = Field(default_factory=datetime.now)

# BC Transfer Model
class BCTransfer(BaseModel):
    memberId: str
    newBc: str
    transferDate: datetime
    notes: Optional[str] = ""

# Pending Edit Model
class PendingEdit(BaseModel):
    memberId: str
    pendingAmount: float

# Auction Models
class AuctionBase(BaseModel):
    groupNo: str
    ticketNo: str
    customerName: str
    mobileNo: str
    appuiDate: str
    instOngoing: int
    status: AuctionStatus
    previousArrear: float
    currentAmount: float
    cumShare: float
    toBeCollected: float
    unclaimedAmt: float
    agentCode: str

class AuctionCreate(AuctionBase):
    pass

class Auction(AuctionBase):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    srNo: int
    createdAt: datetime = Field(default_factory=datetime.now)

# Dashboard Stats
class DashboardStats(BaseModel):
    totalGroups: int
    activeGroups: int
    closedGroups: int
    totalMembers: int
    activeMembers: int
    inactiveMembers: int
    totalCollection: float
    monthlyCollection: float
    totalPending: float
    overduePending: float
