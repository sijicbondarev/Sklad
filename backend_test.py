import requests
import json
import sys
from datetime import datetime

class SkladProductionAPITester:
    def __init__(self, base_url):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.results = []

    def run_test(self, name, method, endpoint, expected_status, data=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"Response: {json.dumps(response_data, indent=2)}")
                    self.results.append({
                        "name": name,
                        "status": "PASS",
                        "response": response_data
                    })
                    return success, response_data
                except:
                    print(f"Response: {response.text}")
                    self.results.append({
                        "name": name,
                        "status": "PASS",
                        "response": response.text
                    })
                    return success, response.text
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"Response: {response.text}")
                self.results.append({
                    "name": name,
                    "status": "FAIL",
                    "error": f"Expected status {expected_status}, got {response.status_code}",
                    "response": response.text
                })
                return False, None

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.results.append({
                "name": name,
                "status": "ERROR",
                "error": str(e)
            })
            return False, None

    def test_hello_world(self):
        """Test the root endpoint"""
        return self.run_test(
            "Hello World API",
            "GET",
            "api",
            200
        )

    def test_status_check(self):
        """Test the status check endpoint"""
        data = {
            "client_name": f"test_client_{datetime.now().strftime('%Y%m%d%H%M%S')}"
        }
        return self.run_test(
            "Status Check API",
            "POST",
            "api/status",
            200,
            data=data
        )

    def test_send_telegram(self):
        """Test the send telegram endpoint"""
        data = {
            "chat_id": "542053490",
            "text": "Test message from API test"
        }
        return self.run_test(
            "Send Telegram API",
            "POST",
            "api/send-telegram",
            200,
            data=data
        )

    def test_contact_form(self):
        """Test the contact form endpoint"""
        data = {
            "name": "Test User",
            "contacts": "test@example.com",
            "message": "This is a test message from the API test"
        }
        return self.run_test(
            "Contact Form API",
            "POST",
            "api/contact",
            200,
            data=data
        )

    def test_order_form(self):
        """Test the order form endpoint"""
        data = {
            "timing_value": "1 минута",
            "due_date_value": "2 недели",
            "video_type": "Реклама",
            "graphics": "Съемка",
            "purpose": "Digital",
            "actor": True,
            "speaker": False,
            "location": True,
            "name": "Test User",
            "contacts": "test@example.com",
            "total": 1500.0
        }
        return self.run_test(
            "Order Form API",
            "POST",
            "api/order",
            200,
            data=data
        )

    def print_summary(self):
        """Print a summary of the test results"""
        print("\n" + "="*50)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        print("="*50)
        
        for result in self.results:
            status_icon = "✅" if result["status"] == "PASS" else "❌"
            print(f"{status_icon} {result['name']}: {result['status']}")
            if result["status"] != "PASS" and "error" in result:
                print(f"   Error: {result['error']}")
        
        print("="*50)
        return self.tests_passed == self.tests_run

def main():
    # Get the backend URL from environment variable or use default
    backend_url = "https://b8e5b5b0-4a4a-41ae-a356-8acfac0fff6e.preview.emergentagent.com"
    
    print(f"Testing API at: {backend_url}")
    
    # Setup tester
    tester = SkladProductionAPITester(backend_url)
    
    # Run tests
    tester.test_hello_world()
    tester.test_status_check()
    tester.test_send_telegram()
    tester.test_contact_form()
    tester.test_order_form()
    
    # Print summary
    all_passed = tester.print_summary()
    
    return 0 if all_passed else 1

if __name__ == "__main__":
    sys.exit(main())