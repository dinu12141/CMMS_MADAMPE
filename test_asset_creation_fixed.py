import requests
import json

# Test asset creation with JSON data
url = "http://localhost:8000/api/assets"
headers = {"Content-Type": "application/json"}
data = {
    "name": "Test Asset JSON",
    "location": "6743a2b1f234330540257195"  # Replace with a valid location ID from your database
}

try:
    response = requests.post(url, headers=headers, data=json.dumps(data))
    print(f"Status Code: {response.status_code}")
    print(f"Response Headers: {response.headers}")
    print(f"Response Text: {response.text}")
    
    if response.status_code == 200:
        print("Asset created successfully!")
        asset = response.json()
        print(f"Created Asset ID: {asset.get('_id')}")
        print(f"Asset Number: {asset.get('assetNumber')}")
    else:
        print("Failed to create asset")
        
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()