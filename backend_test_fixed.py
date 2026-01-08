#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for WETNOSE Veterinary Clinic
Production Cutover - Testing ALL Public and Admin API Endpoints
"""

import asyncio
import aiohttp
import json
import os
from datetime import datetime, timezone
from typing import Dict, Any, Optional

# Get backend URL from frontend .env file
BACKEND_URL = "https://petclinic-9.preview.emergentagent.com"

# Test credentials
ADMIN_EMAIL = "admin@wetnose.com.tr"
ADMIN_PASSWORD = "WetnoseStage2026!"

class WetnoseAPITester:
    def __init__(self):
        self.session = None
        self.access_token = None
        self.base_url = BACKEND_URL
        self.test_results = []
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    def log_test(self, test_name: str, success: bool, details: str, response_data: Any = None):
        """Log test result"""
        result = {
            "test": test_name,
            "success": success,
            "details": details,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "response_data": response_data
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {details}")
        if response_data and not success:
            print(f"   Response: {json.dumps(response_data, indent=2)}")
    
    # ========== ADMIN LOGIN ==========
    async def admin_login(self):
        """Login as admin and get access token"""
        try:
            url = f"{self.base_url}/api/auth/login"
            login_data = {
                "email": ADMIN_EMAIL,
                "password": ADMIN_PASSWORD,
                "remember_me": False
            }
            
            async with self.session.post(url, json=login_data) as response:
                if response.status == 200:
                    data = await response.json()
                    self.access_token = data.get('access_token')
                    self.log_test(
                        "Admin Login",
                        True,
                        f"Successfully logged in as {ADMIN_EMAIL}",
                        {"user_role": data.get('user', {}).get('role')}
                    )
                    return True
                else:
                    error_data = await response.text()
                    self.log_test(
                        "Admin Login",
                        False,
                        f"Login failed HTTP {response.status}: {error_data}"
                    )
                    return False
        except Exception as e:
            self.log_test(
                "Admin Login",
                False,
                f"Login request failed: {str(e)}"
            )
            return False
    
    # ========== PUBLIC API TESTS ==========
    async def test_slider_api(self):
        """Test GET /api/public/slider"""
        try:
            url = f"{self.base_url}/api/public/slider"
            async with self.session.get(url) as response:
                if response.status == 200:
                    data = await response.json()
                    # API returns {slides: [...], settings: {...}}
                    if isinstance(data, dict) and 'slides' in data:
                        slides = data['slides']
                        self.log_test(
                            "Slider API",
                            True,
                            f"Returns slides object with {len(slides)} slides",
                            {"count": len(slides), "has_settings": 'settings' in data}
                        )
                    else:
                        self.log_test(
                            "Slider API",
                            False,
                            "Response does not contain slides array",
                            data
                        )
                else:
                    error_data = await response.text()
                    self.log_test(
                        "Slider API",
                        False,
                        f"HTTP {response.status}: {error_data}"
                    )
        except Exception as e:
            self.log_test(
                "Slider API",
                False,
                f"Request failed: {str(e)}"
            )
    
    async def test_team_api(self):
        """Test GET /api/public/team-members"""
        try:
            url = f"{self.base_url}/api/public/team-members"
            async with self.session.get(url) as response:
                if response.status == 200:
                    data = await response.json()
                    # API returns {team_members: [...], total: N}
                    if isinstance(data, dict) and 'team_members' in data:
                        team_members = data['team_members']
                        self.log_test(
                            "Team API",
                            True,
                            f"Returns team_members object with {len(team_members)} members",
                            {"count": len(team_members), "total": data.get('total')}
                        )
                    else:
                        self.log_test(
                            "Team API",
                            False,
                            "Response does not contain team_members array",
                            data
                        )
                else:
                    error_data = await response.text()
                    self.log_test(
                        "Team API",
                        False,
                        f"HTTP {response.status}: {error_data}"
                    )
        except Exception as e:
            self.log_test(
                "Team API",
                False,
                f"Request failed: {str(e)}"
            )
    
    async def test_services_api(self):
        """Test GET /api/public/services and single service endpoint"""
        # Test services list
        try:
            url = f"{self.base_url}/api/public/services"
            async with self.session.get(url) as response:
                if response.status == 200:
                    data = await response.json()
                    # API returns {services: [...], total: N}
                    if isinstance(data, dict) and 'services' in data:
                        services = data['services']
                        self.log_test(
                            "Services API - List",
                            True,
                            f"Returns services object with {len(services)} services",
                            {"count": len(services), "total": data.get('total')}
                        )
                        
                        # Test single service if we have data
                        if services and len(services) > 0:
                            service_slug = services[0].get('slug')
                            if service_slug:
                                await self.test_single_service(service_slug)
                    else:
                        self.log_test(
                            "Services API - List",
                            False,
                            "Response does not contain services array",
                            data
                        )
                else:
                    error_data = await response.text()
                    self.log_test(
                        "Services API - List",
                        False,
                        f"HTTP {response.status}: {error_data}"
                    )
        except Exception as e:
            self.log_test(
                "Services API - List",
                False,
                f"Request failed: {str(e)}"
            )
    
    async def test_single_service(self, slug: str):
        """Test GET /api/public/services/{slug}"""
        try:
            url = f"{self.base_url}/api/public/services/{slug}"
            async with self.session.get(url) as response:
                if response.status == 200:
                    data = await response.json()
                    self.log_test(
                        "Services API - Single",
                        True,
                        f"Successfully retrieved service: {slug}",
                        {"slug": data.get('slug'), "title": data.get('title')}
                    )
                else:
                    error_data = await response.text()
                    self.log_test(
                        "Services API - Single",
                        False,
                        f"HTTP {response.status} for slug '{slug}': {error_data}"
                    )
        except Exception as e:
            self.log_test(
                "Services API - Single",
                False,
                f"Request failed for slug '{slug}': {str(e)}"
            )
    
    async def test_blog_api(self):
        """Test blog endpoints"""
        # Test blog list
        try:
            url = f"{self.base_url}/api/public/blog"
            async with self.session.get(url) as response:
                if response.status == 200:
                    data = await response.json()
                    # API returns {posts: [...], total: N}
                    if isinstance(data, dict) and 'posts' in data:
                        posts = data['posts']
                        self.log_test(
                            "Blog API - List",
                            True,
                            f"Returns blog posts object with {len(posts)} posts",
                            {"count": len(posts), "total": data.get('total')}
                        )
                        
                        # Test single blog post if we have data
                        if posts and len(posts) > 0:
                            blog_slug = posts[0].get('slug')
                            if blog_slug:
                                await self.test_single_blog_post(blog_slug)
                    else:
                        self.log_test(
                            "Blog API - List",
                            False,
                            "Response does not contain posts array",
                            data
                        )
                else:
                    error_data = await response.text()
                    self.log_test(
                        "Blog API - List",
                        False,
                        f"HTTP {response.status}: {error_data}"
                    )
        except Exception as e:
            self.log_test(
                "Blog API - List",
                False,
                f"Request failed: {str(e)}"
            )
        
        # Test nonexistent blog post (should return 404)
        await self.test_nonexistent_blog_post()
    
    async def test_single_blog_post(self, slug: str):
        """Test GET /api/public/blog/{slug}"""
        try:
            url = f"{self.base_url}/api/public/blog/{slug}"
            async with self.session.get(url) as response:
                if response.status == 200:
                    data = await response.json()
                    self.log_test(
                        "Blog API - Single (Valid)",
                        True,
                        f"Successfully retrieved blog post: {slug}",
                        {"slug": data.get('slug'), "title": data.get('title')}
                    )
                else:
                    error_data = await response.text()
                    self.log_test(
                        "Blog API - Single (Valid)",
                        False,
                        f"HTTP {response.status} for slug '{slug}': {error_data}"
                    )
        except Exception as e:
            self.log_test(
                "Blog API - Single (Valid)",
                False,
                f"Request failed for slug '{slug}': {str(e)}"
            )
    
    async def test_nonexistent_blog_post(self):
        """Test GET /api/public/blog/nonexistent-slug-12345 (should return 404)"""
        try:
            url = f"{self.base_url}/api/public/blog/nonexistent-slug-12345"
            async with self.session.get(url) as response:
                if response.status == 404:
                    self.log_test(
                        "Blog API - 404 Test",
                        True,
                        "Correctly returns 404 for nonexistent blog post"
                    )
                else:
                    error_data = await response.text()
                    self.log_test(
                        "Blog API - 404 Test",
                        False,
                        f"Expected 404 but got HTTP {response.status}: {error_data}"
                    )
        except Exception as e:
            self.log_test(
                "Blog API - 404 Test",
                False,
                f"Request failed: {str(e)}"
            )
    
    async def test_gallery_api(self):
        """Test gallery endpoints"""
        # Test gallery list
        try:
            url = f"{self.base_url}/api/public/gallery"
            async with self.session.get(url) as response:
                if response.status == 200:
                    data = await response.json()
                    # Check if it's a list or object with albums
                    if isinstance(data, list):
                        self.log_test(
                            "Gallery API - List",
                            True,
                            f"Returns gallery albums array with {len(data)} albums",
                            {"count": len(data)}
                        )
                    elif isinstance(data, dict) and 'albums' in data:
                        albums = data['albums']
                        self.log_test(
                            "Gallery API - List",
                            True,
                            f"Returns gallery albums object with {len(albums)} albums",
                            {"count": len(albums)}
                        )
                    else:
                        self.log_test(
                            "Gallery API - List",
                            True,
                            f"Returns gallery data (format: {type(data).__name__})",
                            {"data_type": type(data).__name__}
                        )
                else:
                    error_data = await response.text()
                    self.log_test(
                        "Gallery API - List",
                        False,
                        f"HTTP {response.status}: {error_data}"
                    )
        except Exception as e:
            self.log_test(
                "Gallery API - List",
                False,
                f"Request failed: {str(e)}"
            )
        
        # Test random gallery
        try:
            url = f"{self.base_url}/api/public/gallery/random"
            async with self.session.get(url) as response:
                if response.status == 200:
                    data = await response.json()
                    if isinstance(data, list):
                        self.log_test(
                            "Gallery API - Random",
                            True,
                            f"Returns random images array with {len(data)} images",
                            {"count": len(data)}
                        )
                    else:
                        self.log_test(
                            "Gallery API - Random",
                            True,
                            f"Returns random images data (format: {type(data).__name__})",
                            {"data_type": type(data).__name__}
                        )
                else:
                    error_data = await response.text()
                    self.log_test(
                        "Gallery API - Random",
                        False,
                        f"HTTP {response.status}: {error_data}"
                    )
        except Exception as e:
            self.log_test(
                "Gallery API - Random",
                False,
                f"Request failed: {str(e)}"
            )
    
    async def test_contact_form(self):
        """Test POST /api/public/contact"""
        try:
            url = f"{self.base_url}/api/public/contact"
            contact_data = {
                "name": "Ahmet Yılmaz",
                "email": "ahmet@example.com",
                "subject": "Kedi Muayenesi",
                "message": "Kedim için genel muayene randevusu almak istiyorum."
            }
            
            async with self.session.post(url, json=contact_data) as response:
                if response.status == 200:
                    data = await response.json()
                    self.log_test(
                        "Contact Form",
                        True,
                        "Contact form submission successful",
                        data
                    )
                else:
                    error_data = await response.text()
                    self.log_test(
                        "Contact Form",
                        False,
                        f"HTTP {response.status}: {error_data}"
                    )
        except Exception as e:
            self.log_test(
                "Contact Form",
                False,
                f"Request failed: {str(e)}"
            )
    
    async def test_appointment_request(self):
        """Test POST /api/public/appointment-request"""
        try:
            url = f"{self.base_url}/api/public/appointment-request"
            appointment_data = {
                "name": "Mehmet Demir",
                "phone": "05551234567",
                "pet_name": "Luna",
                "pet_type": "Köpek"
            }
            
            async with self.session.post(url, json=appointment_data) as response:
                if response.status == 200:
                    data = await response.json()
                    self.log_test(
                        "Appointment Request",
                        True,
                        "Appointment request submission successful",
                        data
                    )
                else:
                    error_data = await response.text()
                    self.log_test(
                        "Appointment Request",
                        False,
                        f"HTTP {response.status}: {error_data}"
                    )
        except Exception as e:
            self.log_test(
                "Appointment Request",
                False,
                f"Request failed: {str(e)}"
            )
    
    async def test_feedback_form(self):
        """Test POST /api/public/feedback"""
        try:
            url = f"{self.base_url}/api/public/feedback"
            feedback_data = {
                "full_name": "Ayşe Kaya",
                "email": "ayse@example.com",
                "pet_name": "Minnoş",
                "rating": 5,
                "feedback_type": "positive",
                "comment": "Harika bir hizmet aldık, çok memnun kaldık!"
            }
            
            async with self.session.post(url, json=feedback_data) as response:
                if response.status == 200:
                    data = await response.json()
                    self.log_test(
                        "Feedback Form",
                        True,
                        "Feedback submission successful",
                        data
                    )
                else:
                    error_data = await response.text()
                    self.log_test(
                        "Feedback Form",
                        False,
                        f"HTTP {response.status}: {error_data}"
                    )
        except Exception as e:
            self.log_test(
                "Feedback Form",
                False,
                f"Request failed: {str(e)}"
            )
    
    async def test_maintenance_status(self):
        """Test GET /api/public/maintenance-status"""
        try:
            url = f"{self.base_url}/api/public/maintenance-status"
            async with self.session.get(url) as response:
                if response.status == 200:
                    data = await response.json()
                    required_fields = ['maintenance_mode', 'maintenance_message', 'maintenance_end_date', 'phone', 'whatsapp', 'email']
                    missing_fields = [field for field in required_fields if field not in data]
                    
                    if missing_fields:
                        self.log_test(
                            "Maintenance Status",
                            False,
                            f"Missing required fields: {missing_fields}",
                            data
                        )
                    else:
                        self.log_test(
                            "Maintenance Status",
                            True,
                            f"All required fields present. Maintenance mode: {data.get('maintenance_mode')}",
                            data
                        )
                else:
                    error_data = await response.text()
                    self.log_test(
                        "Maintenance Status",
                        False,
                        f"HTTP {response.status}: {error_data}"
                    )
        except Exception as e:
            self.log_test(
                "Maintenance Status",
                False,
                f"Request failed: {str(e)}"
            )
    
    async def test_clinic_rhythm(self):
        """Test GET /api/public/clinic-rhythm/today"""
        try:
            url = f"{self.base_url}/api/public/clinic-rhythm/today"
            async with self.session.get(url) as response:
                if response.status == 200:
                    data = await response.json()
                    self.log_test(
                        "Clinic Rhythm",
                        True,
                        "Successfully retrieved today's clinic rhythm data",
                        data
                    )
                else:
                    error_data = await response.text()
                    self.log_test(
                        "Clinic Rhythm",
                        False,
                        f"HTTP {response.status}: {error_data}"
                    )
        except Exception as e:
            self.log_test(
                "Clinic Rhythm",
                False,
                f"Request failed: {str(e)}"
            )
    
    # ========== ADMIN API SECURITY TESTS ==========
    async def test_unauthorized_admin_access(self):
        """Test admin endpoints without token (should return 401)"""
        admin_endpoints = [
            "/api/admin/users",
            "/api/admin/blog",
            "/api/admin/crm/appointments",
            "/api/admin/dashboard/stats",
            "/api/admin/contact/messages",
            "/api/admin/testimonials",
            "/api/admin/audit-logs"
        ]
        
        for endpoint in admin_endpoints:
            try:
                url = f"{self.base_url}{endpoint}"
                async with self.session.get(url) as response:
                    if response.status == 401:
                        self.log_test(
                            f"Unauthorized Access - {endpoint}",
                            True,
                            "Correctly returns 401 for unauthorized access"
                        )
                    else:
                        error_data = await response.text()
                        self.log_test(
                            f"Unauthorized Access - {endpoint}",
                            False,
                            f"Expected 401 but got HTTP {response.status}: {error_data}"
                        )
            except Exception as e:
                self.log_test(
                    f"Unauthorized Access - {endpoint}",
                    False,
                    f"Request failed: {str(e)}"
                )
    
    # ========== ADMIN CRUD TESTS (WITH TOKEN) ==========
    async def test_admin_endpoints_with_token(self):
        """Test admin endpoints with valid token"""
        if not self.access_token:
            self.log_test(
                "Admin CRUD Tests",
                False,
                "No access token available - admin login required"
            )
            return
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        admin_endpoints = [
            ("/api/admin/dashboard/stats", "Dashboard Stats"),
            ("/api/admin/contact/messages", "Contact Messages"),
            ("/api/admin/crm/appointments", "CRM Appointments"),
            ("/api/admin/testimonials", "Testimonials"),
            ("/api/admin/audit-logs", "Audit Logs")
        ]
        
        for endpoint, name in admin_endpoints:
            try:
                url = f"{self.base_url}{endpoint}"
                async with self.session.get(url, headers=headers) as response:
                    if response.status == 200:
                        data = await response.json()
                        self.log_test(
                            f"Admin API - {name}",
                            True,
                            f"Successfully retrieved {name.lower()}",
                            {"data_type": type(data).__name__, "count": len(data) if isinstance(data, list) else "N/A"}
                        )
                    else:
                        error_data = await response.text()
                        self.log_test(
                            f"Admin API - {name}",
                            False,
                            f"HTTP {response.status}: {error_data}"
                        )
            except Exception as e:
                self.log_test(
                    f"Admin API - {name}",
                    False,
                    f"Request failed: {str(e)}"
                )
    
    # ========== VALIDATION TESTS ==========
    async def test_contact_form_validation(self):
        """Test contact form with invalid data"""
        # Test invalid email
        try:
            url = f"{self.base_url}/api/public/contact"
            invalid_data = {
                "name": "Test User",
                "email": "invalid-email",
                "subject": "Test",
                "message": "Test message"
            }
            
            async with self.session.post(url, json=invalid_data) as response:
                if response.status == 422:  # Validation error
                    self.log_test(
                        "Contact Form Validation - Invalid Email",
                        True,
                        "Correctly rejects invalid email format"
                    )
                elif response.status == 400:  # Bad request
                    self.log_test(
                        "Contact Form Validation - Invalid Email",
                        True,
                        "Correctly rejects invalid email format (400)"
                    )
                else:
                    error_data = await response.text()
                    self.log_test(
                        "Contact Form Validation - Invalid Email",
                        False,
                        f"Expected validation error but got HTTP {response.status}: {error_data}"
                    )
        except Exception as e:
            self.log_test(
                "Contact Form Validation - Invalid Email",
                False,
                f"Request failed: {str(e)}"
            )
        
        # Test empty required fields
        try:
            url = f"{self.base_url}/api/public/contact"
            empty_data = {
                "name": "",
                "email": "",
                "subject": "",
                "message": ""
            }
            
            async with self.session.post(url, json=empty_data) as response:
                if response.status in [422, 400]:  # Validation error
                    self.log_test(
                        "Contact Form Validation - Empty Fields",
                        True,
                        "Correctly rejects empty required fields"
                    )
                else:
                    error_data = await response.text()
                    self.log_test(
                        "Contact Form Validation - Empty Fields",
                        False,
                        f"Expected validation error but got HTTP {response.status}: {error_data}"
                    )
        except Exception as e:
            self.log_test(
                "Contact Form Validation - Empty Fields",
                False,
                f"Request failed: {str(e)}"
            )
    
    async def run_all_tests(self):
        """Run comprehensive backend API tests"""
        print(f"🧪 Starting WETNOSE Comprehensive Backend API Tests")
        print(f"🌐 Backend URL: {self.base_url}")
        print(f"👤 Admin Email: {ADMIN_EMAIL}")
        print("=" * 80)
        
        # ========== PUBLIC API TESTS ==========
        print("\n🌍 PUBLIC API TESTS")
        print("-" * 40)
        
        await self.test_slider_api()
        await self.test_team_api()
        await self.test_services_api()
        await self.test_blog_api()
        await self.test_gallery_api()
        await self.test_contact_form()
        await self.test_appointment_request()
        await self.test_feedback_form()
        await self.test_maintenance_status()
        await self.test_clinic_rhythm()
        
        # ========== ADMIN SECURITY TESTS ==========
        print("\n🔒 ADMIN SECURITY TESTS (Unauthorized)")
        print("-" * 40)
        
        await self.test_unauthorized_admin_access()
        
        # ========== ADMIN LOGIN & CRUD TESTS ==========
        print("\n🔑 ADMIN LOGIN & CRUD TESTS")
        print("-" * 40)
        
        login_success = await self.admin_login()
        
        if login_success:
            await self.test_admin_endpoints_with_token()
        
        # ========== VALIDATION TESTS ==========
        print("\n✅ VALIDATION TESTS")
        print("-" * 40)
        
        await self.test_contact_form_validation()
        
        # ========== SUMMARY ==========
        print("\n" + "=" * 80)
        print("📊 COMPREHENSIVE TEST SUMMARY")
        print("=" * 80)
        
        passed = sum(1 for result in self.test_results if result['success'])
        total = len(self.test_results)
        
        print(f"✅ Passed: {passed}/{total}")
        print(f"❌ Failed: {total - passed}/{total}")
        
        # Group results by category
        categories = {
            "Public API": [],
            "Admin Security": [],
            "Admin CRUD": [],
            "Validation": [],
            "Other": []
        }
        
        for result in self.test_results:
            test_name = result['test']
            if any(x in test_name for x in ["Slider", "Team", "Services", "Blog", "Gallery", "Contact Form", "Appointment", "Feedback", "Maintenance", "Clinic"]):
                categories["Public API"].append(result)
            elif "Unauthorized" in test_name:
                categories["Admin Security"].append(result)
            elif "Admin API" in test_name or "Admin Login" in test_name:
                categories["Admin CRUD"].append(result)
            elif "Validation" in test_name:
                categories["Validation"].append(result)
            else:
                categories["Other"].append(result)
        
        for category, results in categories.items():
            if results:
                passed_cat = sum(1 for r in results if r['success'])
                total_cat = len(results)
                print(f"\n📋 {category}: {passed_cat}/{total_cat}")
                
                # Show failed tests in this category
                failed_tests = [r for r in results if not r['success']]
                if failed_tests:
                    print(f"   ❌ Failed:")
                    for result in failed_tests:
                        print(f"      • {result['test']}: {result['details']}")
        
        return self.test_results


async def main():
    """Main test runner"""
    async with WetnoseAPITester() as tester:
        results = await tester.run_all_tests()
        
        # Save results to file
        with open('/app/backend_test_results.json', 'w') as f:
            json.dump(results, f, indent=2, default=str)
        
        print(f"\n💾 Test results saved to: /app/backend_test_results.json")
        
        return results


if __name__ == "__main__":
    asyncio.run(main())