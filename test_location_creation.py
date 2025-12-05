import requests
import json

# Test location creation
url = "http://localhost:8000/api/locations"
headers = {
    "Content-Type": "application/json"
}
data = {
    "name": "Test Location",
    "type": "building",
    "address": "123 Test St",
    "city": "Test City",
    "state": "TS",
    "zipCode": "12345"
}

try:
    response = requests.post(url, headers=headers, data=json.dumps(data))
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")