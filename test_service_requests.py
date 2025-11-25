import requests
import json

# Test the service requests API
BASE_URL = "http://localhost:8000/api"

def test_service_requests():
    print("Testing Service Requests API...")
    
    # Test 1: Get all service requests
    print("\n1. Getting all service requests:")
    try:
        response = requests.get(f"{BASE_URL}/service-requests")
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            requests_data = response.json()
            print(f"Found {len(requests_data)} service requests")
            if requests_data:
                print(f"First request: {requests_data[0]}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Error connecting to API: {e}")
    
    # Test 2: Create a new service request
    print("\n2. Creating a new service request:")
    new_request = {
        "title": "Test Service Request",
        "description": "This is a test request created via API",
        "requestedBy": "API Tester",
        "department": "IT",
        "location": "Building A",
        "priority": "medium",
        "category": "General"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/service-requests", json=new_request)
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            created_request = response.json()
            print(f"Created request: {created_request}")
            request_id = created_request.get("id")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Error creating service request: {e}")

if __name__ == "__main__":
    test_service_requests()