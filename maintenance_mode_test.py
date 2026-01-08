#!/usr/bin/env python3
"""
WETNOSE Veterinary Clinic - Maintenance Mode Comprehensive Testing
Testing all aspects of maintenance mode functionality as requested
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

class MaintenanceModeAPITester:
    def __init__(self):
        self.session = None
        self.access_token = None
        self.base_url = BACKEND_URL
        self.test_results = []
        self.original_maintenance_state = None
        
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
    
    async def test_1_1_maintenance_status_endpoint(self):
        """Test 1.1: Maintenance Status Endpoint (Public)"""
        try:
            url = f"{self.base_url}/api/public/maintenance-status"
            async with self.session.get(url) as response:
                if response.status == 200:
                    data = await response.json()
                    required_fields = ['maintenance_mode', 'maintenance_message', 'phone', 'whatsapp', 'email']
                    missing_fields = [field for field in required_fields if field not in data]
                    
                    if missing_fields:
                        self.log_test(
                            "Test 1.1: Maintenance Status Endpoint",
                            False,
                            f"Missing required fields: {missing_fields}",
                            data
                        )
                    else:
                        # Store original state for cleanup
                        self.original_maintenance_state = data.get('maintenance_mode')
                        self.log_test(
                            "Test 1.1: Maintenance Status Endpoint",
                            True,
                            f"All required fields present. Current maintenance_mode: {data.get('maintenance_mode')}",
                            data
                        )
                else:
                    error_data = await response.text()
                    self.log_test(
                        "Test 1.1: Maintenance Status Endpoint",
                        False,
                        f"HTTP {response.status}: {error_data}"
                    )
        except Exception as e:
            self.log_test(
                "Test 1.1: Maintenance Status Endpoint",
                False,
                f"Request failed: {str(e)}"
            )
    
    async def get_current_settings(self):
        """Get current admin settings"""
        if not self.access_token:
            return None
            
        try:
            url = f"{self.base_url}/api/admin/settings"
            headers = {"Authorization": f"Bearer {self.access_token}"}
            
            async with self.session.get(url, headers=headers) as response:
                if response.status == 200:
                    return await response.json()
                else:
                    return None
        except Exception as e:
            print(f"Error getting settings: {e}")
            return None
    
    async def update_maintenance_mode(self, enabled: bool, message: str = "Test maintenance message"):
        """Update maintenance mode setting"""
        if not self.access_token:
            return False
            
        try:
            # Get current settings first
            current_settings = await self.get_current_settings()
            if not current_settings:
                return False
            
            url = f"{self.base_url}/api/admin/settings"
            headers = {"Authorization": f"Bearer {self.access_token}"}
            
            update_data = {
                **current_settings,
                "maintenance_mode": enabled,
                "maintenance_message": message
            }
            
            # Remove fields that shouldn't be in update request
            for field in ['id', 'updated_at', 'updated_by']:
                update_data.pop(field, None)
            
            async with self.session.put(url, headers=headers, json=update_data) as response:
                if response.status == 200:
                    data = await response.json()
                    return data.get('maintenance_mode') == enabled
                else:
                    return False
        except Exception as e:
            print(f"Error updating maintenance mode: {e}")
            return False
    
    async def test_1_2_enable_maintenance_mode(self):
        """Test 1.2: Bakım Modunu AÇ"""
        success = await self.update_maintenance_mode(True, "Sitemiz güncelleniyor - Test mesajı")
        
        if success:
            # Verify the change
            url = f"{self.base_url}/api/public/maintenance-status"
            async with self.session.get(url) as response:
                if response.status == 200:
                    data = await response.json()
                    if data.get('maintenance_mode') == True:
                        self.log_test(
                            "Test 1.2: Enable Maintenance Mode",
                            True,
                            "Successfully enabled maintenance mode and verified via public endpoint",
                            {"maintenance_mode": data.get('maintenance_mode'), "message": data.get('maintenance_message')}
                        )
                    else:
                        self.log_test(
                            "Test 1.2: Enable Maintenance Mode",
                            False,
                            f"Maintenance mode not enabled. Got: {data.get('maintenance_mode')}"
                        )
                else:
                    self.log_test(
                        "Test 1.2: Enable Maintenance Mode",
                        False,
                        f"Failed to verify maintenance mode via public endpoint: HTTP {response.status}"
                    )
        else:
            self.log_test(
                "Test 1.2: Enable Maintenance Mode",
                False,
                "Failed to enable maintenance mode via admin settings"
            )
    
    async def test_1_3_disable_maintenance_mode(self):
        """Test 1.3: Bakım Modunu KAPAT"""
        success = await self.update_maintenance_mode(False)
        
        if success:
            # Verify the change
            url = f"{self.base_url}/api/public/maintenance-status"
            async with self.session.get(url) as response:
                if response.status == 200:
                    data = await response.json()
                    if data.get('maintenance_mode') == False:
                        self.log_test(
                            "Test 1.3: Disable Maintenance Mode",
                            True,
                            "Successfully disabled maintenance mode and verified via public endpoint",
                            {"maintenance_mode": data.get('maintenance_mode')}
                        )
                    else:
                        self.log_test(
                            "Test 1.3: Disable Maintenance Mode",
                            False,
                            f"Maintenance mode not disabled. Got: {data.get('maintenance_mode')}"
                        )
                else:
                    self.log_test(
                        "Test 1.3: Disable Maintenance Mode",
                        False,
                        f"Failed to verify maintenance mode via public endpoint: HTTP {response.status}"
                    )
        else:
            self.log_test(
                "Test 1.3: Disable Maintenance Mode",
                False,
                "Failed to disable maintenance mode via admin settings"
            )
    
    async def test_api_endpoints_during_maintenance(self):
        """Test API endpoints accessibility during maintenance mode"""
        # First enable maintenance mode
        await self.update_maintenance_mode(True, "API Test - Maintenance Mode")
        
        # Test public endpoints (should work)
        public_endpoints = [
            "/api/public/maintenance-status",
            "/api/public/settings",
            "/api/public/services"
        ]
        
        for endpoint in public_endpoints:
            try:
                url = f"{self.base_url}{endpoint}"
                async with self.session.get(url) as response:
                    if response.status == 200:
                        self.log_test(
                            f"API Access During Maintenance: {endpoint}",
                            True,
                            f"Public endpoint accessible during maintenance mode"
                        )
                    else:
                        self.log_test(
                            f"API Access During Maintenance: {endpoint}",
                            False,
                            f"Public endpoint not accessible: HTTP {response.status}"
                        )
            except Exception as e:
                self.log_test(
                    f"API Access During Maintenance: {endpoint}",
                    False,
                    f"Request failed: {str(e)}"
                )
        
        # Test admin endpoints (should work with auth)
        admin_endpoints = [
            "/api/admin/settings",
            "/api/auth/me"
        ]
        
        headers = {"Authorization": f"Bearer {self.access_token}"}
        for endpoint in admin_endpoints:
            try:
                url = f"{self.base_url}{endpoint}"
                async with self.session.get(url, headers=headers) as response:
                    if response.status == 200:
                        self.log_test(
                            f"Admin API Access During Maintenance: {endpoint}",
                            True,
                            f"Admin endpoint accessible during maintenance mode"
                        )
                    else:
                        self.log_test(
                            f"Admin API Access During Maintenance: {endpoint}",
                            False,
                            f"Admin endpoint not accessible: HTTP {response.status}"
                        )
            except Exception as e:
                self.log_test(
                    f"Admin API Access During Maintenance: {endpoint}",
                    False,
                    f"Request failed: {str(e)}"
                )
        
        # Disable maintenance mode for cleanup
        await self.update_maintenance_mode(False)
    
    async def cleanup_maintenance_state(self):
        """Restore original maintenance state"""
        if self.original_maintenance_state is not None:
            await self.update_maintenance_mode(self.original_maintenance_state)
            print(f"   🔄 Restored maintenance mode to original state: {self.original_maintenance_state}")
    
    async def run_all_tests(self):
        """Run all maintenance mode API tests"""
        print(f"🧪 Starting WETNOSE Maintenance Mode API Tests")
        print(f"🌐 Backend URL: {self.base_url}")
        print(f"👤 Admin Email: {ADMIN_EMAIL}")
        print("=" * 80)
        
        # Test 1.1: Public maintenance status endpoint
        await self.test_1_1_maintenance_status_endpoint()
        
        # Admin login
        login_success = await self.admin_login()
        
        if login_success:
            # Test 1.2: Enable maintenance mode
            await self.test_1_2_enable_maintenance_mode()
            
            # Test 1.3: Disable maintenance mode
            await self.test_1_3_disable_maintenance_mode()
            
            # Test API endpoints during maintenance
            await self.test_api_endpoints_during_maintenance()
            
            # Cleanup
            await self.cleanup_maintenance_state()
        
        # Summary
        print("\n" + "=" * 80)
        print("📊 MAINTENANCE MODE API TEST SUMMARY")
        print("=" * 80)
        
        passed = sum(1 for result in self.test_results if result['success'])
        total = len(self.test_results)
        
        print(f"✅ Passed: {passed}/{total}")
        print(f"❌ Failed: {total - passed}/{total}")
        
        if total - passed > 0:
            print("\n🔍 FAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"   ❌ {result['test']}: {result['details']}")
        
        return self.test_results


async def main():
    """Main test runner"""
    async with MaintenanceModeAPITester() as tester:
        results = await tester.run_all_tests()
        
        # Save results to file
        with open('/app/maintenance_mode_test_results.json', 'w') as f:
            json.dump(results, f, indent=2, default=str)
        
        print(f"\n💾 Test results saved to: /app/maintenance_mode_test_results.json")
        
        return results


if __name__ == "__main__":
    asyncio.run(main())