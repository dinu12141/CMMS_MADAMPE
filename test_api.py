import requests
import time

def test_api_connection():
    """Test if the backend API is accessible"""
    print("Testing CMMS API Connection...")
    print("=" * 40)
    
    # Test base URL
    try:
        print("1. Testing base API endpoint...")
        response = requests.get("http://localhost:8000/api/", timeout=5)
        if response.status_code == 200:
            print(f"   ✓ API Base: {response.json()}")
        else:
            print(f"   ✗ API Base failed with status {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("   ✗ API Base: Connection refused - server not running")
    except Exception as e:
        print(f"   ✗ API Base: Error - {str(e)}")
    
    # Test inventory endpoint
    try:
        print("2. Testing inventory endpoint...")
        response = requests.get("http://localhost:8000/api/inventory", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"   ✓ Inventory: Retrieved {len(data)} items")
        else:
            print(f"   ✗ Inventory failed with status {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("   ✗ Inventory: Connection refused - server not running")
    except Exception as e:
        print(f"   ✗ Inventory: Error - {str(e)}")
    
    # Test work orders endpoint
    try:
        print("3. Testing work orders endpoint...")
        response = requests.get("http://localhost:8000/api/work-orders", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"   ✓ Work Orders: Retrieved {len(data)} items")
        else:
            print(f"   ✗ Work Orders failed with status {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("   ✗ Work Orders: Connection refused - server not running")
    except Exception as e:
        print(f"   ✗ Work Orders: Error - {str(e)}")
    
    # Test assets endpoint
    try:
        print("4. Testing assets endpoint...")
        response = requests.get("http://localhost:8000/api/assets", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"   ✓ Assets: Retrieved {len(data)} items")
        else:
            print(f"   ✗ Assets failed with status {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("   ✗ Assets: Connection refused - server not running")
    except Exception as e:
        print(f"   ✗ Assets: Error - {str(e)}")

    print("\n" + "=" * 40)
    print("Test completed. If you see connection errors, make sure:")
    print("1. The backend server is running (start_backend.bat)")
    print("2. MongoDB is accessible")
    print("3. No firewall is blocking the connection")

if __name__ == "__main__":
    test_api_connection()