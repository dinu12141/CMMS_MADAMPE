from fastapi import FastAPI, APIRouter
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path

# Import the routes
from routes.work_orders import router as work_orders_router
from routes.assets import router as assets_router
from routes.inventory import router as inventory_router
from routes.service_requests import router as service_requests_router
from routes.locations import router as locations_router
from routes.documents import router as documents_router
from routes.preventive import router as preventive_router
from routes.notifications import router as notifications_router
# Auth router එකත් Import කරන්න (කලින් හැදුවා නම්)
# from routes import auth

from database import connect_to_firestore, close_firestore_connection

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create the main app
app = FastAPI()

# CORS Configuration (must run before routers)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

@api_router.get("/")
def root():
    return {"message": "Hello World"}

# Include the router in the main app
app.include_router(api_router)

# Serve static uploads directory
UPLOADS_DIR = ROOT_DIR / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

# Serve static uploaded_assets directory
UPLOADED_ASSETS_DIR = ROOT_DIR / "uploaded_assets"
UPLOADED_ASSETS_DIR.mkdir(exist_ok=True)
app.mount("/uploaded_assets", StaticFiles(directory=str(UPLOADED_ASSETS_DIR)), name="uploaded_assets")

# Include the routes
app.include_router(work_orders_router, prefix="/api")
app.include_router(assets_router, prefix="/api")
app.include_router(inventory_router, prefix="/api")
app.include_router(service_requests_router, prefix="/api")
app.include_router(locations_router, prefix="/api")
app.include_router(documents_router, prefix="/api")
app.include_router(preventive_router, prefix="/api")
app.include_router(notifications_router, prefix="/api")
# app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"]) # Auth තිබුනොත් මේක Uncomment කරන්න

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
def startup_db_client():
    # Firebase Connection (NO await here!)
    connect_to_firestore()

@app.on_event("shutdown")
def shutdown_db_client():
    # Close Connection (NO await here!)
    close_firestore_connection()