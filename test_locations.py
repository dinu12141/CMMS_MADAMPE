import requests
import json

# Test the locations API
BASE_URL = "http://localhost:8000/api"

def test_locations():
    print("Testing Locations API...")
    
    # Test 1: Get all locations
    print("\n1. Getting all locations:")
    try:
        response = requests.get(f"{BASE_URL}/locations")
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            locations_data = response.json()
            print(f"Found {len(locations_data)} locations")
            if locations_data:
                print(f"First location: {locations_data[0]}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Error connecting to API: {e}")
    
    # Test 2: Create a new location
    print("\n2. Creating a new location:")
    new_location = {
        "name": "Test Building",
        "type": "building",
        "address": "123 Test Street",
        "city": "Test City",
        "state": "TS",
        "zipCode": "12345",
        "coordinates": {"lat": 40.7128, "lng": -74.0060},
        "size": 50000,
        "floors": 5
    }
    
    try:
        response = requests.post(f"{BASE_URL}/locations", json=new_location)
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            created_location = response.json()
            print(f"Created location: {created_location}")
            location_id = created_location.get("id")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Error creating location: {e}")

if __name__ == "__main__":
    test_locations()