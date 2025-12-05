# CMMS System - Running Instructions

## Fixes Applied

1. **Updated start scripts** to remove MongoDB dependencies and use Firebase instead
2. **Fixed .env files** by resolving merge conflicts and removing duplicates
3. **Added file upload functionality** for service requests:
   - Added file upload endpoint in backend (`/service-requests/{id}/upload-file`)
   - Updated ServiceRequest model to include attachments field
   - Updated frontend modal to allow file selection
   - Updated API service to handle file uploads

## How to Run the System

### Prerequisites
- Python 3.8+
- Node.js 14+
- Firebase project with service account key (already configured)

### Running the Backend
1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install Python dependencies (if not already installed):
   ```
   pip install -r requirements.txt
   ```

3. Start the backend server:
   ```
   python -m uvicorn server:app --reload --host 0.0.0.0 --port 8000
   ```

### Running the Frontend
1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install Node dependencies (if not already installed):
   ```
   npm install
   ```

3. Start the frontend server:
   ```
   npm start
   ```

### Running Both Services
You can also use the provided batch scripts:
- `start_backend_firebase.bat` - Starts only the backend
- `start_frontend.bat` - Starts only the frontend
- `start_full_system.bat` - Starts both services

## Accessing the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## File Upload Feature
The service requests now support file attachments:
1. When creating or editing a service request, use the "Attach File" field
2. Files will be stored locally in `backend/uploads/service_requests/`
3. File information will be stored in Firestore under the service request's `attachments` field