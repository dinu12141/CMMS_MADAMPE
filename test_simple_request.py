import requests
import json

# Test sending a simple JSON request
url = "http://localhost:8000/api/assets"
headers = {"Content-Type": "application/json"}
data = {
    "name": "Simple Test Asset",
    "location": "69249fee0a78cf2addbeaa6c"
}

print("Sending request...")
print("URL:", url)
print("Headers:", headers)
print("Data:", json.dumps(data, indent=2))

try:
    response = requests.post(url, headers=headers, data=json.dumps(data))
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()