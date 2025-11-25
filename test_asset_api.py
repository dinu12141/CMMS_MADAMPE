import requests
import json

# Test asset creation
url = "http://127.0.0.1:8000/api/assets"
data = {
    "name": "Test Asset API",
    "location": "Test Location API"
}

try:
    response = requests.post(url, data=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response Headers: {response.headers}")
    print(f"Response Text: {response.text}")
except Exception as e:
    print(f"Error: {e}")