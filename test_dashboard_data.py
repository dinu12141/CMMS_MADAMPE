import requests
import json
from datetime import datetime

def test_dashboard_data():
    """Test script to verify dashboard data fetching"""
    
    # Test work orders API
    print("Testing Work Orders API...")
    try:
        work_orders_response = requests.get("http://localhost:8000/api/work-orders")
        if work_orders_response.status_code == 200:
            work_orders = work_orders_response.json()
            print(f"✓ Work Orders API: {len(work_orders)} work orders fetched")
            if work_orders:
                wo = work_orders[0]
                print(f"  Sample work order: {wo.get('workOrderNumber', 'N/A')} - {wo.get('title', 'N/A')}")
        else:
            print(f"✗ Work Orders API failed with status {work_orders_response.status_code}")
    except Exception as e:
        print(f"✗ Work Orders API error: {e}")
    
    # Test assets API
    print("\nTesting Assets API...")
    try:
        assets_response = requests.get("http://localhost:8000/api/assets")
        if assets_response.status_code == 200:
            assets = assets_response.json()
            print(f"✓ Assets API: {len(assets)} assets fetched")
            if assets:
                asset = assets[0]
                print(f"  Sample asset: {asset.get('assetNumber', 'N/A')} - {asset.get('name', 'N/A')}")
        else:
            print(f"✗ Assets API failed with status {assets_response.status_code}")
    except Exception as e:
        print(f"✗ Assets API error: {e}")

    # Test creating a sample work order
    print("\nTesting Work Order Creation...")
    try:
        # First get a location ID
        locations_response = requests.get("http://localhost:8000/api/locations")
        if locations_response.status_code == 200:
            locations = locations_response.json()
            if locations:
                location_id = locations[0].get('_id')
                sample_wo = {
                    "title": "Dashboard Test Work Order",
                    "description": "Test work order created for dashboard testing",
                    "priority": "medium",
                    "type": "preventive",
                    "dueDate": "2025-12-31T23:59:59",
                    "estimatedTime": 2.5,
                    "location": location_id,
                    "cost": 100.0
                }
                
                create_response = requests.post(
                    "http://localhost:8000/api/work-orders",
                    headers={"Content-Type": "application/json"},
                    data=json.dumps(sample_wo)
                )
                
                if create_response.status_code == 200:
                    created_wo = create_response.json()
                    print(f"✓ Work Order Creation: {created_wo.get('workOrderNumber', 'N/A')} created")
                else:
                    print(f"✗ Work Order Creation failed with status {create_response.status_code}")
            else:
                print("✗ No locations found")
        else:
            print(f"✗ Locations API failed with status {locations_response.status_code}")
    except Exception as e:
        print(f"✗ Work Order Creation error: {e}")

if __name__ == "__main__":
    test_dashboard_data()