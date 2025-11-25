import requests
import json

# Test asset creation with detailed error handling
url = "http://localhost:8000/api/assets"

# Get a location ID from the locations endpoint
try:
    locations_response = requests.get("http://localhost:8000/api/locations")
    locations = locations_response.json()
    
    if locations:
        location_id = locations[0]["_id"]
        print(f"Using location ID: {location_id}")
        
        # Test data
        data = {
            "name": "Test Asset",
            "location": location_id
        }
        
        # Send POST request
        response = requests.post(url, json=data)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {response.headers}")
        print(f"Response Text: {response.text}")
        
        if response.status_code != 200:
            try:
                error_data = response.json()
                print(f"Error Data: {error_data}")
            except:
                print("Could not parse error response as JSON")
    else:
        print("No locations found")
except Exception as e:
    print(f"Error: {e}")