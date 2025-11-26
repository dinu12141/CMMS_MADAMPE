import requests
import json

# Test what the frontend is actually sending
url = "http://localhost:8000/api/assets"

# Test 1: Simple JSON request like the frontend should be sending
headers = {"Content-Type": "application/json"}
data = {
    "name": "Debug Test Asset",
    "location": "69249fee0a78cf2addbeaa6c"  # Use a valid location ID
}

print("=== Test 1: JSON Request ===")
print("URL:", url)
print("Headers:", headers)
print("Data:", json.dumps(data, indent=2))

try:
    response = requests.post(url, headers=headers, data=json.dumps(data))
    print(f"Status Code: {response.status_code}")
    print(f"Response Headers: {response.headers}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "="*50 + "\n")

# Test 2: Form data request (what might happen when there's an image)
print("=== Test 2: Form Data Request ===")
form_data = {
    "name": "Debug Test Asset Form",
    "location": "69249fee0a78cf2addbeaa6c"
}

try:
    response = requests.post(url, data=form_data)
    print(f"Status Code: {response.status_code}")
    print(f"Response Headers: {response.headers}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()