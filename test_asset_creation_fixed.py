import requests

# Test asset creation with image
url = "http://localhost:8000/api/assets"

# Get a location ID from the locations endpoint
try:
    locations_response = requests.get("http://localhost:8000/api/locations")
    locations = locations_response.json()
    
    if locations:
        location_id = locations[0]["_id"]
        print(f"Using location ID: {location_id}")
        
        # Create a simple text file as test image
        with open("test_image.txt", "w") as f:
            f.write("This is a test image file")
        
        # Open file for reading
        with open("test_image.txt", "rb") as image_file:
            # Test data with image
            data = {
                "name": "Test Asset with Image",
                "location": location_id
            }
            
            files = {
                "image": ("test_image.txt", image_file, "text/plain")
            }
            
            # Send POST request with form data and file
            response = requests.post(url, data=data, files=files)
            
            print(f"Status Code: {response.status_code}")
            print(f"Response Headers: {response.headers}")
            print(f"Response Text: {response.text}")
            
            if response.status_code != 200:
                try:
                    error_data = response.json()
                    print(f"Error Data: {error_data}")
                except:
                    print("Could not parse error response as JSON")
                
        # Clean up test file
        import os
        os.remove("test_image.txt")
    else:
        print("No locations found")
except Exception as e:
    print(f"Error: {e}")
    # Clean up test file if it exists
    import os
    if os.path.exists("test_image.txt"):
        os.remove("test_image.txt")