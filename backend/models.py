from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict
from datetime import datetime, date
from bson import ObjectId

# Custom ObjectId type for Pydantic
class PyObjectId(ObjectId):
    @classmethod
    def __get_pydantic_core_schema__(cls, _source_type, _handler):
        from pydantic_core import core_schema
        return core_schema.with_info_plain_validator_function(cls.validate)

    @classmethod
    def validate(cls, v, _info):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, _core_schema, _handler):
        return {'type': 'string'}


# Work Order Models
class WorkOrderCreate(BaseModel):
    title: str
    description: str
    assetId: Optional[str] = None
    priority: str  # critical, high, medium, low
    type: str  # preventive, corrective
    assignedTo: Optional[str] = None
    dueDate: datetime
    estimatedTime: float
    location: str
    cost: float = 0
    partsUsed: List[str] = []
    notes: Optional[str] = ""

class WorkOrderUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    assetId: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    assignedTo: Optional[str] = None
    dueDate: Optional[datetime] = None
    completedDate: Optional[datetime] = None
    estimatedTime: Optional[float] = None
    actualTime: Optional[float] = None
    location: Optional[str] = None
    cost: Optional[float] = None
    partsUsed: Optional[List[str]] = None
    notes: Optional[str] = None

class WorkOrder(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    workOrderNumber: str
    title: str
    description: str
    assetId: Optional[str] = None
    priority: str
    status: str = "open"
    type: str
    assignedTo: Optional[str] = None
    createdBy: str
    createdDate: datetime
    dueDate: datetime
    completedDate: Optional[datetime] = None
    estimatedTime: float
    actualTime: Optional[float] = None
    location: str
    cost: float
    partsUsed: List[str] = []
    notes: str = ""
    updatedAt: datetime

    class Config:
        json_encoders = {ObjectId: str}
        populate_by_name = True


# Asset Models
class AssetCreate(BaseModel):
    assetNumber: Optional[str] = None
    name: str
    category: Optional[str] = None
    manufacturer: Optional[str] = None
    model: Optional[str] = None
    serialNumber: Optional[str] = None
    purchaseDate: Optional[date] = None
    installDate: Optional[date] = None
    warrantyExpiry: Optional[date] = None
    location: str
    criticality: Optional[str] = None  # critical, high, medium, low
    specifications: Optional[Dict] = None
    imageUrl: Optional[str] = None

    @validator('purchaseDate', 'installDate', 'warrantyExpiry', pre=True)
    def parse_date(cls, v):
        if isinstance(v, str):
            try:
                return date.fromisoformat(v)
            except ValueError:
                raise ValueError('Invalid date format. Expected YYYY-MM-DD')
        return v

class AssetUpdate(BaseModel):
    assetNumber: Optional[str] = None
    name: Optional[str] = None
    category: Optional[str] = None
    manufacturer: Optional[str] = None
    model: Optional[str] = None
    serialNumber: Optional[str] = None
    purchaseDate: Optional[date] = None
    installDate: Optional[date] = None
    warrantyExpiry: Optional[date] = None
    location: Optional[str] = None
    status: Optional[str] = None
    condition: Optional[str] = None
    maintenanceCost: Optional[float] = None
    downtime: Optional[int] = None
    lastMaintenance: Optional[date] = None
    nextMaintenance: Optional[date] = None
    criticality: Optional[str] = None
    specifications: Optional[Dict] = None
    imageUrl: Optional[str] = None

class Asset(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    assetNumber: str
    name: str
    category: str = ""
    manufacturer: str = ""
    model: str = ""
    serialNumber: str = ""
    purchaseDate: date
    installDate: date
    warrantyExpiry: date
    location: str
    status: str = "operational"
    condition: str = "good"
    maintenanceCost: float = 0
    downtime: int = 0
    lastMaintenance: Optional[date] = None
    nextMaintenance: Optional[date] = None
    criticality: str = "medium"
    specifications: Dict = {}
    imageUrl: Optional[str] = None
    createdAt: datetime
    updatedAt: datetime

    class Config:
        json_encoders = {ObjectId: str}
        populate_by_name = True


# Preventive Maintenance Models
class PreventiveMaintenanceCreate(BaseModel):
    name: str
    assetId: str
    frequency: str  # daily, weekly, monthly, quarterly, yearly
    nextDue: date
    estimatedDuration: float
    assignedTo: str
    priority: str
    tasks: List[str] = []
    partsRequired: List[str] = []

class PreventiveMaintenanceUpdate(BaseModel):
    name: Optional[str] = None
    assetId: Optional[str] = None
    frequency: Optional[str] = None
    lastCompleted: Optional[date] = None
    nextDue: Optional[date] = None
    estimatedDuration: Optional[float] = None
    assignedTo: Optional[str] = None
    priority: Optional[str] = None
    tasks: Optional[List[str]] = None
    partsRequired: Optional[List[str]] = None
    active: Optional[bool] = None

class PreventiveMaintenance(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    pmNumber: str
    name: str
    assetId: str
    frequency: str
    lastCompleted: Optional[date] = None
    nextDue: date
    estimatedDuration: float
    assignedTo: str
    priority: str
    tasks: List[str] = []
    partsRequired: List[str] = []
    active: bool = True
    createdAt: datetime
    updatedAt: datetime

    class Config:
        json_encoders = {ObjectId: str}
        populate_by_name = True


# Inventory Models
class InventoryItemCreate(BaseModel):
    partNumber: str
    name: str
    category: str
    description: str
    quantity: int
    minStock: int
    maxStock: int
    unit: str
    unitCost: float
    location: str
    supplier: str

class InventoryItemUpdate(BaseModel):
    partNumber: Optional[str] = None
    name: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    quantity: Optional[int] = None
    minStock: Optional[int] = None
    maxStock: Optional[int] = None
    unit: Optional[str] = None
    unitCost: Optional[float] = None
    location: Optional[str] = None
    supplier: Optional[str] = None
    lastOrdered: Optional[date] = None

class InventoryItem(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    partNumber: str
    name: str
    category: str
    description: str
    quantity: int
    minStock: int
    maxStock: int
    unit: str
    unitCost: float
    location: str
    supplier: str
    lastOrdered: Optional[date] = None
    status: str = "in-stock"
    createdAt: datetime
    updatedAt: datetime

    class Config:
        json_encoders = {ObjectId: str}
        populate_by_name = True


# Service Request Models
class ServiceRequestCreate(BaseModel):
    title: str
    description: str
    requestedBy: str
    department: str
    location: str
    priority: str
    category: str
    relatedAsset: Optional[str] = None

class ServiceRequestUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    category: Optional[str] = None
    assignedTo: Optional[str] = None
    convertedToWO: Optional[str] = None
    closedDate: Optional[datetime] = None

class ServiceRequest(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    requestNumber: str
    title: str
    description: str
    requestedBy: str
    department: str
    location: str
    priority: str
    status: str = "open"
    category: str
    relatedAsset: Optional[str] = None
    assignedTo: Optional[str] = None
    convertedToWO: Optional[str] = None
    createdDate: datetime
    closedDate: Optional[datetime] = None
    updatedAt: datetime

    class Config:
        json_encoders = {ObjectId: str}
        populate_by_name = True


# Location Models
class LocationCreate(BaseModel):
    name: str
    type: str
    address: str = ""
    city: str = ""
    state: str = ""
    zipCode: str = ""
    coordinates: Dict[str, float] = {"lat": 0.0, "lng": 0.0}
    size: int = 0
    floors: int = 0
    image: Optional[str] = None

class LocationUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zipCode: Optional[str] = None
    coordinates: Optional[Dict[str, float]] = None
    size: Optional[int] = None
    floors: Optional[int] = None
    image: Optional[str] = None

class Location(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    locationId: str
    name: str
    type: str
    address: str = ""
    city: str = ""
    state: str = ""
    zipCode: str = ""
    coordinates: Dict[str, float] = {"lat": 0.0, "lng": 0.0}
    size: int = 0
    floors: int = 0
    image: Optional[str] = None
    assetCount: Optional[int] = 0
    activeWOs: Optional[int] = 0
    createdAt: datetime
    updatedAt: datetime

    class Config:
        json_encoders = {ObjectId: str}
        populate_by_name = True


# User Models
class UserCreate(BaseModel):
    name: str
    email: str
    role: str
    department: str
    phone: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
    department: Optional[str] = None
    phone: Optional[str] = None
    active: Optional[bool] = None

class User(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    userId: str
    name: str
    email: str
    role: str
    department: str
    phone: str
    active: bool = True
    createdAt: datetime
    updatedAt: datetime

    class Config:
        json_encoders = {ObjectId: str}
        populate_by_name = True


# Document Models
class DocumentCreate(BaseModel):
    name: str
    description: str
    category: str
    relatedTo: Optional[str] = None
    relatedType: Optional[str] = None
    expiryDate: Optional[datetime] = None
    tags: List[str] = []

class DocumentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    relatedTo: Optional[str] = None
    relatedType: Optional[str] = None
    expiryDate: Optional[datetime] = None
    tags: Optional[List[str]] = None

class Document(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    documentNumber: str
    name: str
    description: str
    category: str
    fileType: str
    fileName: str
    filePath: str
    fileSize: int
    relatedTo: Optional[str] = None
    relatedType: Optional[str] = None
    uploadedBy: str
    uploadedDate: datetime
    expiryDate: Optional[datetime] = None
    tags: List[str] = []
    createdAt: datetime
    updatedAt: datetime

    class Config:
        json_encoders = {ObjectId: str}
        populate_by_name = True