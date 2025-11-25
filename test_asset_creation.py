import requests
import json

# Test asset creation
url = "http://127.0.0.1:8000/api/assets"
headers = {"Content-Type": "application/json"}
data = {
    "name": "Test Asset 2",
    "location": "Test Location"
}

try:
    response = requests.post(url, headers=headers, data=json.dumps(data))
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")