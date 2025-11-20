# CMMS Application - Backend Implementation Contract

## Overview
This document outlines the API contracts, database models, and implementation plan for the CMMS (Computerized Maintenance Management System) backend.

## Technology Stack
- **Backend**: FastAPI (Python)
- **Database**: MongoDB (Motor async driver)
- **Authentication**: JWT-based (optional for now)
- **File Storage**: Local filesystem for documents

## Database Models

### 1. WorkOrder
```python
{
    "_id": ObjectId,
    "workOrderNumber": "WO-001",  # Auto-generated, unique
    "title": str,
    "description": str,
    "assetId": ObjectId,  # Reference to Asset
    "priority": str,  # critical, high, medium, low
    "status": str,  # open, in-progress, scheduled, completed
    "type": str,  # preventive, corrective
    "assignedTo": ObjectId,  # Reference to User
    "createdBy": ObjectId,  # Reference to User
    "createdDate": datetime,
    "dueDate": datetime,
    "completedDate": datetime (optional),
    "estimatedTime": float,  # hours
    "actualTime": float (optional),  # hours
    "location": str,
    "cost": float,
    "partsUsed": [str],  # Array of part numbers
    "notes": str,
    "updatedAt": datetime,
}
```

### 2. Asset
```python
{
    "_id": ObjectId,
    "assetNumber": "ASSET-001",  # Auto-generated, unique
    "name": str,
    "category": str,
    "manufacturer": str,
    "model": str,
    "serialNumber": str,
    "purchaseDate": date,
    "installDate": date,
    "warrantyExpiry": date,
    "location": str,
    "status": str,  # operational, maintenance, degraded, offline
    "condition": str,  # excellent, good, fair, poor
    "maintenanceCost": float,
    "downtime": int,  # hours
    "lastMaintenance": date,
    "nextMaintenance": date,
    "criticality": str,  # critical, high, medium, low
    "specifications": dict,
    "createdAt": datetime,
    "updatedAt": datetime,
}
```

### 3. PreventiveMaintenance
```python
{
    "_id": ObjectId,
    "pmNumber": "PM-001",  # Auto-generated, unique
    "name": str,
    "assetId": ObjectId,  # Reference to Asset
    "frequency": str,  # daily, weekly, monthly, quarterly, yearly
    "lastCompleted": date,
    "nextDue": date,
    "estimatedDuration": float,  # hours
    "assignedTo": ObjectId,  # Reference to User
    "priority": str,
    "tasks": [str],  # Array of task descriptions
    "partsRequired": [str],  # Array of part numbers
    "active": bool,
    "createdAt": datetime,
    "updatedAt": datetime,
}
```

### 4. InventoryItem
```python
{
    "_id": ObjectId,
    "partNumber": str,  # Unique
    "name": str,
    "category": str,
    "description": str,
    "quantity": int,
    "minStock": int,
    "maxStock": int,
    "unit": str,
    "unitCost": float,
    "location": str,
    "supplier": str,
    "lastOrdered": date,
    "status": str,  # in-stock, low-stock, critical, out-of-stock
    "createdAt": datetime,
    "updatedAt": datetime,
}
```

### 5. ServiceRequest
```python
{
    "_id": ObjectId,
    "requestNumber": "SR-001",  # Auto-generated, unique
    "title": str,
    "description": str,
    "requestedBy": str,
    "department": str,
    "location": str,
    "priority": str,  # high, medium, low
    "status": str,  # open, assigned, converted, closed
    "category": str,
    "relatedAsset": ObjectId (optional),  # Reference to Asset
    "assignedTo": ObjectId (optional),  # Reference to User
    "convertedToWO": ObjectId (optional),  # Reference to WorkOrder
    "createdDate": datetime,
    "closedDate": datetime (optional),
    "updatedAt": datetime,
}
```

### 6. Location
```python
{
    "_id": ObjectId,
    "locationId": "LOC-001",  # Auto-generated, unique
    "name": str,
    "type": str,  # building, warehouse, facility
    "address": str,
    "city": str,
    "state": str,
    "zipCode": str,
    "coordinates": {
        "lat": float,
        "lng": float
    },
    "size": int,  # square feet
    "floors": int,
    "createdAt": datetime,
    "updatedAt": datetime,
}
```

### 7. User
```python
{
    "_id": ObjectId,
    "userId": "USER-001",  # Auto-generated, unique
    "name": str,
    "email": str,  # Unique
    "role": str,  # Admin, Manager, Technician, Viewer
    "department": str,
    "phone": str,
    "active": bool,
    "createdAt": datetime,
    "updatedAt": datetime,
}
```

### 8. Document
```python
{
    "_id": ObjectId,
    "documentNumber": "DOC-001",  # Auto-generated, unique
    "name": str,
    "description": str,
    "category": str,  # manual, certificate, report, procedure, warranty, photo
    "fileType": str,  # pdf, doc, xlsx, jpg, etc.
    "fileName": str,  # Actual file name on disk
    "filePath": str,  # Path to file
    "fileSize": int,  # bytes
    "relatedTo": ObjectId (optional),  # Can be Asset, WorkOrder, etc.
    "relatedType": str (optional),  # asset, workorder, etc.
    "uploadedBy": ObjectId,  # Reference to User
    "uploadedDate": datetime,
    "expiryDate": datetime (optional),
    "tags": [str],
    "createdAt": datetime,
    "updatedAt": datetime,
}
```

## API Endpoints

### Work Orders
- `GET /api/work-orders` - List all work orders (with filters)
- `GET /api/work-orders/{id}` - Get single work order
- `POST /api/work-orders` - Create new work order
- `PUT /api/work-orders/{id}` - Update work order
- `DELETE /api/work-orders/{id}` - Delete work order
- `GET /api/work-orders/stats` - Get work order statistics

### Assets
- `GET /api/assets` - List all assets (with filters)
- `GET /api/assets/{id}` - Get single asset
- `POST /api/assets` - Create new asset
- `PUT /api/assets/{id}` - Update asset
- `DELETE /api/assets/{id}` - Delete asset
- `GET /api/assets/{id}/maintenance-history` - Get maintenance history

### Preventive Maintenance
- `GET /api/preventive-maintenance` - List all PM schedules
- `GET /api/preventive-maintenance/{id}` - Get single PM schedule
- `POST /api/preventive-maintenance` - Create new PM schedule
- `PUT /api/preventive-maintenance/{id}` - Update PM schedule
- `DELETE /api/preventive-maintenance/{id}` - Delete PM schedule
- `POST /api/preventive-maintenance/{id}/generate-wo` - Generate work order from PM

### Inventory
- `GET /api/inventory` - List all inventory items (with filters)
- `GET /api/inventory/{id}` - Get single inventory item
- `POST /api/inventory` - Create new inventory item
- `PUT /api/inventory/{id}` - Update inventory item
- `DELETE /api/inventory/{id}` - Delete inventory item
- `PUT /api/inventory/{id}/adjust-stock` - Adjust stock quantity

### Service Requests
- `GET /api/service-requests` - List all service requests
- `GET /api/service-requests/{id}` - Get single service request
- `POST /api/service-requests` - Create new service request
- `PUT /api/service-requests/{id}` - Update service request
- `POST /api/service-requests/{id}/convert-to-wo` - Convert to work order
- `DELETE /api/service-requests/{id}` - Delete service request

### Locations
- `GET /api/locations` - List all locations
- `GET /api/locations/{id}` - Get single location
- `POST /api/locations` - Create new location
- `PUT /api/locations/{id}` - Update location
- `DELETE /api/locations/{id}` - Delete location

### Users
- `GET /api/users` - List all users
- `GET /api/users/{id}` - Get single user
- `POST /api/users` - Create new user
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

### Documents
- `GET /api/documents` - List all documents (with filters)
- `GET /api/documents/{id}` - Get document metadata
- `POST /api/documents/upload` - Upload new document (multipart/form-data)
- `GET /api/documents/{id}/download` - Download document file
- `PUT /api/documents/{id}` - Update document metadata
- `DELETE /api/documents/{id}` - Delete document

### Analytics
- `GET /api/analytics/dashboard` - Dashboard analytics
- `GET /api/analytics/cost-trends` - Maintenance cost trends
- `GET /api/analytics/downtime` - Equipment downtime analysis
- `GET /api/analytics/compliance` - Work order compliance stats

## Frontend Integration Plan

### Mock Data Replacement
All data in `/app/frontend/src/mockData.js` will be replaced with API calls:

1. **Dashboard Page**: 
   - Remove mock `analytics` data
   - Fetch from `/api/analytics/dashboard`
   - Fetch recent work orders from `/api/work-orders?limit=5&sort=-createdDate`

2. **Work Orders Page**:
   - Remove mock `workOrders` data
   - Fetch from `/api/work-orders` with filters
   - Create new WO via POST to `/api/work-orders`

3. **Assets Page**:
   - Remove mock `assets` data
   - Fetch from `/api/assets` with filters
   - Create/Update via POST/PUT to `/api/assets`

4. **Preventive Maintenance Page**:
   - Remove mock `preventiveMaintenance` data
   - Fetch from `/api/preventive-maintenance`
   - Generate WO via POST to `/api/preventive-maintenance/{id}/generate-wo`

5. **Inventory Page**:
   - Remove mock `inventory` data
   - Fetch from `/api/inventory` with filters
   - Update stock via PUT to `/api/inventory/{id}/adjust-stock`

6. **Service Requests Page**:
   - Remove mock `serviceRequests` data
   - Fetch from `/api/service-requests`
   - Convert to WO via POST to `/api/service-requests/{id}/convert-to-wo`

7. **Locations Page**:
   - Remove mock `locations` data
   - Fetch from `/api/locations`

8. **Documents Page**:
   - Remove mock `documents` data
   - Fetch from `/api/documents` with filters
   - Upload via POST to `/api/documents/upload`
   - Download via GET to `/api/documents/{id}/download`

9. **Settings Page**:
   - Remove mock `users` data
   - Fetch from `/api/users`
   - Create/Update users via POST/PUT to `/api/users`

10. **Analytics Page**:
    - Remove mock `analytics` data
    - Fetch from `/api/analytics/cost-trends`, `/api/analytics/downtime`, `/api/analytics/compliance`

## Implementation Steps

1. ✅ Frontend with mock data (COMPLETED)
2. Create MongoDB models with Pydantic
3. Implement CRUD operations for each model
4. Create API endpoints with FastAPI
5. Add file upload/download for documents
6. Implement auto-numbering for entities (WO-001, ASSET-001, etc.)
7. Add analytics aggregation endpoints
8. Replace frontend mock data with API calls
9. Test all endpoints
10. Add error handling and validation

## Notes
- All dates stored in ISO 8601 format
- File uploads will be stored in `/app/backend/uploads` directory
- Each model will have `createdAt` and `updatedAt` timestamps
- ObjectIds will be converted to strings in API responses
- Implement pagination for list endpoints (page, limit params)
