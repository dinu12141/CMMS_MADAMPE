# CMMS MADAMPE MILLS

A comprehensive Computerized Maintenance Management System for industrial facilities.

## Prerequisites

1. **Node.js** (version 14 or higher)
2. **Python** (version 3.8 or higher)
3. **MongoDB** (version 4.4 or higher)

## Installation

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install --legacy-peer-deps
   ```

3. Start the frontend development server:
   ```
   npm start
   ```

### Backend Setup

1. Install MongoDB from [MongoDB Community Server](https://www.mongodb.com/try/download/community)

2. Navigate to the backend directory:
   ```
   cd backend
   ```

3. Install Python dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Start the backend server:
   ```
   python -m uvicorn server:app --reload
   ```

### Alternative Startup (Windows)

On Windows, you can use the provided batch file to start both MongoDB and the backend server:

```
start_backend.bat
```

## Usage

1. Start the backend services (MongoDB and Python server)
2. Start the frontend development server
3. Open your browser to `http://localhost:3000`

## Work Orders Section

The Work Orders section now supports full CRUD operations:
- **Create**: Add new work orders with all necessary details
- **Read**: View all work orders with filtering and search capabilities
- **Update**: Edit existing work orders
- **Delete**: Remove work orders when no longer needed

If the backend services are not running, the application will automatically fall back to mock data for demonstration purposes.

## Troubleshooting

### Backend Connection Issues

If you see "Unable to connect to the backend" messages:

1. Ensure MongoDB is running
2. Check that the backend server is started
3. Verify the connection settings in `backend/.env`

### Frontend Issues

If the frontend fails to start:

1. Make sure all dependencies are installed:
   ```
   npm install --legacy-peer-deps
   ```

2. Clear npm cache:
   ```
   npm cache clean --force
   ```

3. Delete `node_modules` and reinstall:
   ```
   rm -rf node_modules
   npm install --legacy-peer-deps
   ```