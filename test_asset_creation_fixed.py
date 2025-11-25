import requests
import json

# Test asset creation with form data
url = "http://127.0.0.1:8000/api/assets"
data = {
    "name": "Test Asset Fixed",
    "location": "Test Location"
}

try:
    response = requests.post(url, data=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")