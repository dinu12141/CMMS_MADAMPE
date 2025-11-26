import requests
import json

def test_asset_creation():
    # First get locations to find a valid location ID
    locations_url = "http://localhost:8000/api/locations"
    try:
        locations_response = requests.get(locations_url)
        if locations_response.status_code == 200:
            locations = locations_response.json()
            if locations:
                location_id = locations[0]["_id"]
                print(f"Using location ID: {location_id}")
                
                # Now create an asset with this location
                asset_url = "http://localhost:8000/api/assets"
                headers = {"Content-Type": "application/json"}
                asset_data = {
                    "name": "Test Asset Comprehensive",
                    "location": location_id,
                    "category": "Test Equipment",
                    "manufacturer": "Test Manufacturer",
                    "model": "Test Model XYZ",
                    "serialNumber": "SN-123456",
                    "criticality": "medium",
                    "specifications": {
                        "capacity": "100 units",
                        "power": "220V",
                        "weight": "50kg"
                    }
                }
                
                print("Sending asset data:", json.dumps(asset_data, indent=2))
                
                asset_response = requests.post(asset_url, headers=headers, data=json.dumps(asset_data))
                print(f"\nAsset Creation Status Code: {asset_response.status_code}")
                print(f"Asset Creation Response Headers: {asset_response.headers}")
                
                if asset_response.status_code == 200:
                    asset = asset_response.json()
                    print("Asset created successfully!")
                    print(f"Created Asset ID: {asset.get('_id')}")
                    print(f"Asset Number: {asset.get('assetNumber')}")
                    print(f"Asset Name: {asset.get('name')}")
                    print(f"Asset Location: {asset.get('location')}")
                    return True
                else:
                    print("Failed to create asset")
                    try:
                        error_data = asset_response.json()
                        print(f"Error Data: {error_data}")
                    except:
                        print("Response text:", asset_response.text)
                    return False
            else:
                print("No locations found in the system")
                return False
        else:
            print(f"Failed to get locations. Status code: {locations_response.status_code}")
            try:
                error_data = locations_response.json()
                print(f"Error: {error_data}")
            except:
                print("Response text:", locations_response.text)
            return False
            
    except Exception as e:
        print(f"Error during test: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_asset_creation()
    if success:
        print("\nTest completed successfully!")
    else:
        print("\nTest failed!")