#!/usr/bin/env python3
"""
Comprehensive API Testing for Wetnose Veterinary Clinic Next.js App
Tests all public API endpoints and authentication flow
"""

import requests
import json
import sys
from datetime import datetime

class WetnoseAPITester:
    def __init__(self, base_url="http://localhost:3000"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def log_result(self, test_name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {test_name} - PASSED")
        else:
            self.failed_tests.append(f"{test_name}: {details}")
            print(f"❌ {test_name} - FAILED: {details}")

    def test_api_endpoint(self, name, endpoint, method="GET", data=None, expected_status=200, headers=None):
        """Test a single API endpoint"""
        url = f"{self.base_url}{endpoint}"
        
        if headers is None:
            headers = {'Content-Type': 'application/json'}
        
        if self.token and 'Authorization' not in headers:
            headers['Authorization'] = f'Bearer {self.token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            success = response.status_code == expected_status
            
            if success:
                self.log_result(name, True)
                try:
                    return response.json()
                except:
                    return response.text
            else:
                self.log_result(name, False, f"Expected {expected_status}, got {response.status_code}")
                return None

        except requests.exceptions.RequestException as e:
            self.log_result(name, False, f"Request failed: {str(e)}")
            return None

    def test_public_endpoints(self):
        """Test all public API endpoints"""
        print("\n🔍 Testing Public API Endpoints...")
        
        # Test public endpoints
        endpoints = [
            ("Settings API", "/api/public/settings"),
            ("Services API", "/api/public/services"),
            ("Team Members API", "/api/public/team-members"),
            ("Blog API", "/api/public/blog"),
            ("Gallery API", "/api/public/gallery"),
            ("Testimonials API", "/api/public/testimonials"),
            ("Slider API", "/api/public/slider"),
        ]
        
        for name, endpoint in endpoints:
            self.test_api_endpoint(name, endpoint)

    def test_authentication(self):
        """Test authentication flow"""
        print("\n🔐 Testing Authentication...")
        
        # Test login with stage admin credentials
        login_data = {
            "email": "admin@wetnose.com",
            "password": "WetNose2024!"
        }
        
        response = self.test_api_endpoint(
            "Admin Login", 
            "/api/auth/login", 
            method="POST", 
            data=login_data,
            expected_status=200
        )
        
        if response and 'access_token' in response:
            self.token = response['access_token']
            print(f"🎫 Token received: {self.token[:20]}...")
            
            # Test auth/me endpoint with token
            self.test_api_endpoint("Auth Me", "/api/auth/me")
        else:
            self.log_result("Token Extraction", False, "No token in login response")

    def test_contact_form(self):
        """Test contact form submission"""
        print("\n📧 Testing Contact Form...")
        
        contact_data = {
            "name": "Test User",
            "email": "test@example.com",
            "phone": "555-1234",
            "message": "Test message from API test"
        }
        
        self.test_api_endpoint(
            "Contact Form Submission",
            "/api/contact",
            method="POST",
            data=contact_data,
            expected_status=200
        )

    def run_all_tests(self):
        """Run all API tests"""
        print(f"🚀 Starting Wetnose API Tests at {datetime.now()}")
        print(f"🎯 Testing against: {self.base_url}")
        
        # Test public endpoints
        self.test_public_endpoints()
        
        # Test authentication
        self.test_authentication()
        
        # Test contact form
        self.test_contact_form()
        
        # Print summary
        print(f"\n📊 Test Summary:")
        print(f"Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Tests Failed: {len(self.failed_tests)}")
        
        if self.failed_tests:
            print(f"\n❌ Failed Tests:")
            for failure in self.failed_tests:
                print(f"  - {failure}")
        
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"Success Rate: {success_rate:.1f}%")
        
        return len(self.failed_tests) == 0

def main():
    """Main test execution"""
    tester = WetnoseAPITester()
    success = tester.run_all_tests()
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())