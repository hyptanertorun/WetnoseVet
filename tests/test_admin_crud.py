"""
Admin CRUD API Tests for Wetnose Veterinary Clinic
Tests: Settings, Services, Team Members, Gallery, Roles
"""
import pytest
import requests
import os
import time

BASE_URL = "https://rhythm-loop-test.preview.emergentagent.com"
ADMIN_EMAIL = "admin@wetnose.com.tr"
ADMIN_PASSWORD = "WetnoseStage2026!"


class TestAuth:
    """Authentication tests"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "access_token" in data
        return data["access_token"]
    
    def test_login_success(self):
        """Test admin login with valid credentials"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert "user" in data
        assert data["user"]["email"] == ADMIN_EMAIL
        assert data["user"]["role"] == "admin"
        print(f"✓ Login successful for {ADMIN_EMAIL}")
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "wrong@email.com", "password": "wrongpass"}
        )
        assert response.status_code == 401
        print("✓ Invalid credentials rejected correctly")


class TestSettings:
    """Settings CRUD tests"""
    
    @pytest.fixture(scope="class")
    def auth_headers(self):
        """Get auth headers"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        token = response.json()["access_token"]
        return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    
    def test_get_settings(self, auth_headers):
        """Test GET /api/admin/settings"""
        response = requests.get(f"{BASE_URL}/api/admin/settings", headers=auth_headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert "clinic_name" in data
        assert "phone" in data
        assert "email" in data
        print(f"✓ Settings retrieved: clinic_name={data.get('clinic_name')}")
    
    def test_update_settings(self, auth_headers):
        """Test PUT /api/admin/settings"""
        # First get current settings
        get_response = requests.get(f"{BASE_URL}/api/admin/settings", headers=auth_headers)
        original_data = get_response.json()
        
        # Update with test data
        update_data = {
            "clinic_name": "TEST_Wetnose Veteriner Kliniği",
            "phone": original_data.get("phone", "0212 555 1234")
        }
        
        response = requests.put(
            f"{BASE_URL}/api/admin/settings",
            headers=auth_headers,
            json=update_data
        )
        assert response.status_code == 200, f"Update failed: {response.text}"
        
        # Verify update persisted
        verify_response = requests.get(f"{BASE_URL}/api/admin/settings", headers=auth_headers)
        verify_data = verify_response.json()
        assert verify_data["clinic_name"] == "TEST_Wetnose Veteriner Kliniği"
        
        # Restore original
        restore_data = {"clinic_name": original_data.get("clinic_name", "Wetnose Veteriner Kliniği")}
        requests.put(f"{BASE_URL}/api/admin/settings", headers=auth_headers, json=restore_data)
        
        print("✓ Settings update and save working correctly")


class TestServices:
    """Services CRUD tests"""
    
    @pytest.fixture(scope="class")
    def auth_headers(self):
        """Get auth headers"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        token = response.json()["access_token"]
        return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    
    def test_list_services(self, auth_headers):
        """Test GET /api/admin/services"""
        response = requests.get(f"{BASE_URL}/api/admin/services", headers=auth_headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert "services" in data
        assert "total" in data
        print(f"✓ Services list retrieved: {data['total']} services found")
    
    def test_create_service(self, auth_headers):
        """Test POST /api/admin/services"""
        service_data = {
            "title": "TEST_Aşılama Hizmeti",
            "short_description": "Test aşılama hizmeti açıklaması",
            "cover_image_url": "https://example.com/test-image.jpg",
            "status": "draft"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/admin/services",
            headers=auth_headers,
            json=service_data
        )
        assert response.status_code == 200, f"Create failed: {response.text}"
        data = response.json()
        assert "id" in data
        assert "slug" in data
        
        # Store for cleanup
        service_id = data["id"]
        print(f"✓ Service created: id={service_id}")
        
        # Verify by GET
        verify_response = requests.get(f"{BASE_URL}/api/admin/services/{service_id}", headers=auth_headers)
        assert verify_response.status_code == 200
        verify_data = verify_response.json()
        assert verify_data["title"] == "TEST_Aşılama Hizmeti"
        print("✓ Service creation verified via GET")
        
        # Cleanup - delete the test service
        delete_response = requests.delete(f"{BASE_URL}/api/admin/services/{service_id}", headers=auth_headers)
        assert delete_response.status_code in [200, 204], f"Delete failed: {delete_response.text}"
        print("✓ Test service cleaned up")
    
    def test_update_service(self, auth_headers):
        """Test PUT /api/admin/services/{id}"""
        # First create a service
        create_data = {
            "title": "TEST_Update Service",
            "short_description": "Original description",
            "cover_image_url": "https://example.com/test.jpg",
            "status": "draft"
        }
        create_response = requests.post(f"{BASE_URL}/api/admin/services", headers=auth_headers, json=create_data)
        service_id = create_response.json()["id"]
        
        # Update it
        update_data = {
            "title": "TEST_Updated Service Title",
            "short_description": "Updated description"
        }
        update_response = requests.put(
            f"{BASE_URL}/api/admin/services/{service_id}",
            headers=auth_headers,
            json=update_data
        )
        assert update_response.status_code == 200, f"Update failed: {update_response.text}"
        
        # Verify update
        verify_response = requests.get(f"{BASE_URL}/api/admin/services/{service_id}", headers=auth_headers)
        verify_data = verify_response.json()
        assert verify_data["title"] == "TEST_Updated Service Title"
        print("✓ Service update working correctly")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/admin/services/{service_id}", headers=auth_headers)


class TestTeamMembers:
    """Team Members CRUD tests"""
    
    @pytest.fixture(scope="class")
    def auth_headers(self):
        """Get auth headers"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        token = response.json()["access_token"]
        return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    
    def test_list_team_members(self, auth_headers):
        """Test GET /api/admin/team-members"""
        response = requests.get(f"{BASE_URL}/api/admin/team-members", headers=auth_headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert "team_members" in data
        assert "total" in data
        print(f"✓ Team members list retrieved: {data['total']} members found")
    
    def test_create_team_member(self, auth_headers):
        """Test POST /api/admin/team-members"""
        member_data = {
            "full_name": "TEST_Dr. Test Veteriner",
            "role_title": "Veteriner Hekim",
            "photo_url": "https://example.com/test-photo.jpg",
            "status": "draft"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/admin/team-members",
            headers=auth_headers,
            json=member_data
        )
        assert response.status_code == 200, f"Create failed: {response.text}"
        data = response.json()
        assert "id" in data
        
        member_id = data["id"]
        print(f"✓ Team member created: id={member_id}")
        
        # Verify by GET
        verify_response = requests.get(f"{BASE_URL}/api/admin/team-members/{member_id}", headers=auth_headers)
        assert verify_response.status_code == 200
        verify_data = verify_response.json()
        assert verify_data["full_name"] == "TEST_Dr. Test Veteriner"
        print("✓ Team member creation verified via GET")
        
        # Cleanup
        delete_response = requests.delete(f"{BASE_URL}/api/admin/team-members/{member_id}", headers=auth_headers)
        assert delete_response.status_code in [200, 204], f"Delete failed: {delete_response.text}"
        print("✓ Test team member cleaned up")
    
    def test_update_team_member(self, auth_headers):
        """Test PUT /api/admin/team-members/{id}"""
        # Create
        create_data = {
            "full_name": "TEST_Update Member",
            "role_title": "Original Role",
            "photo_url": "https://example.com/test.jpg",
            "status": "draft"
        }
        create_response = requests.post(f"{BASE_URL}/api/admin/team-members", headers=auth_headers, json=create_data)
        member_id = create_response.json()["id"]
        
        # Update
        update_data = {
            "full_name": "TEST_Updated Member Name",
            "role_title": "Updated Role"
        }
        update_response = requests.put(
            f"{BASE_URL}/api/admin/team-members/{member_id}",
            headers=auth_headers,
            json=update_data
        )
        assert update_response.status_code == 200, f"Update failed: {update_response.text}"
        
        # Verify
        verify_response = requests.get(f"{BASE_URL}/api/admin/team-members/{member_id}", headers=auth_headers)
        verify_data = verify_response.json()
        assert verify_data["full_name"] == "TEST_Updated Member Name"
        print("✓ Team member update working correctly")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/admin/team-members/{member_id}", headers=auth_headers)


class TestGallery:
    """Gallery CRUD tests"""
    
    @pytest.fixture(scope="class")
    def auth_headers(self):
        """Get auth headers"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        token = response.json()["access_token"]
        return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    
    def test_list_gallery_albums(self, auth_headers):
        """Test GET /api/admin/gallery"""
        response = requests.get(f"{BASE_URL}/api/admin/gallery", headers=auth_headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert "albums" in data
        assert "total" in data
        print(f"✓ Gallery albums retrieved: {data['total']} albums found")
    
    def test_list_gallery_albums_backward_compat(self, auth_headers):
        """Test GET /api/admin/gallery/albums (backward compatibility)"""
        response = requests.get(f"{BASE_URL}/api/admin/gallery/albums", headers=auth_headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert "albums" in data
        print(f"✓ Gallery albums (backward compat) retrieved: {len(data['albums'])} albums")
    
    def test_create_album(self, auth_headers):
        """Test POST /api/admin/gallery"""
        album_data = {
            "title": "TEST_Test Album",
            "description": "Test album description"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/admin/gallery",
            headers=auth_headers,
            json=album_data
        )
        assert response.status_code == 200, f"Create failed: {response.text}"
        data = response.json()
        assert "id" in data
        
        album_id = data["id"]
        print(f"✓ Album created: id={album_id}")
        
        # Verify album exists in list
        list_response = requests.get(f"{BASE_URL}/api/admin/gallery", headers=auth_headers)
        list_data = list_response.json()
        album_found = any(a["id"] == album_id for a in list_data["albums"])
        assert album_found, "Created album not found in list"
        print("✓ Album creation verified in list")
        
        # Cleanup
        delete_response = requests.delete(f"{BASE_URL}/api/admin/gallery/{album_id}", headers=auth_headers)
        assert delete_response.status_code in [200, 204], f"Delete failed: {delete_response.text}"
        print("✓ Test album cleaned up")
    
    def test_update_album(self, auth_headers):
        """Test PUT /api/admin/gallery/{id}"""
        # Create
        create_data = {"title": "TEST_Update Album", "description": "Original"}
        create_response = requests.post(f"{BASE_URL}/api/admin/gallery", headers=auth_headers, json=create_data)
        album_id = create_response.json()["id"]
        
        # Update
        update_data = {"title": "TEST_Updated Album Title", "description": "Updated description"}
        update_response = requests.put(
            f"{BASE_URL}/api/admin/gallery/{album_id}",
            headers=auth_headers,
            json=update_data
        )
        assert update_response.status_code == 200, f"Update failed: {update_response.text}"
        
        # Verify
        list_response = requests.get(f"{BASE_URL}/api/admin/gallery", headers=auth_headers)
        list_data = list_response.json()
        updated_album = next((a for a in list_data["albums"] if a["id"] == album_id), None)
        assert updated_album is not None
        assert updated_album["title"] == "TEST_Updated Album Title"
        print("✓ Album update working correctly")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/admin/gallery/{album_id}", headers=auth_headers)


class TestRoles:
    """Roles/Permissions tests"""
    
    @pytest.fixture(scope="class")
    def auth_headers(self):
        """Get auth headers"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        token = response.json()["access_token"]
        return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    
    def test_get_roles_permissions(self, auth_headers):
        """Test GET /api/admin/roles/permissions"""
        response = requests.get(f"{BASE_URL}/api/admin/roles/permissions", headers=auth_headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert "roles" in data
        assert "available_permissions" in data
        
        # Verify role structure
        roles = data["roles"]
        assert len(roles) > 0
        admin_role = next((r for r in roles if r["role"] == "admin"), None)
        assert admin_role is not None
        assert "permissions" in admin_role
        
        print(f"✓ Roles retrieved: {len(roles)} roles, {len(data['available_permissions'])} permissions")


class TestEndToEndCRUD:
    """End-to-end CRUD flow tests"""
    
    @pytest.fixture(scope="class")
    def auth_headers(self):
        """Get auth headers"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        token = response.json()["access_token"]
        return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    
    def test_full_service_crud_flow(self, auth_headers):
        """Test complete Create -> Read -> Update -> Delete flow for services"""
        # CREATE
        create_data = {
            "title": "TEST_E2E Service",
            "short_description": "E2E test service",
            "cover_image_url": "https://example.com/e2e.jpg",
            "status": "draft"
        }
        create_response = requests.post(f"{BASE_URL}/api/admin/services", headers=auth_headers, json=create_data)
        assert create_response.status_code == 200
        service_id = create_response.json()["id"]
        print(f"✓ E2E CREATE: Service {service_id}")
        
        # READ
        read_response = requests.get(f"{BASE_URL}/api/admin/services/{service_id}", headers=auth_headers)
        assert read_response.status_code == 200
        assert read_response.json()["title"] == "TEST_E2E Service"
        print("✓ E2E READ: Service verified")
        
        # UPDATE
        update_data = {"title": "TEST_E2E Service Updated", "status": "published"}
        update_response = requests.put(f"{BASE_URL}/api/admin/services/{service_id}", headers=auth_headers, json=update_data)
        assert update_response.status_code == 200
        
        # Verify update
        verify_response = requests.get(f"{BASE_URL}/api/admin/services/{service_id}", headers=auth_headers)
        assert verify_response.json()["title"] == "TEST_E2E Service Updated"
        print("✓ E2E UPDATE: Service updated and verified")
        
        # DELETE
        delete_response = requests.delete(f"{BASE_URL}/api/admin/services/{service_id}", headers=auth_headers)
        assert delete_response.status_code in [200, 204]
        
        # Verify deletion
        verify_delete = requests.get(f"{BASE_URL}/api/admin/services/{service_id}", headers=auth_headers)
        assert verify_delete.status_code == 404
        print("✓ E2E DELETE: Service deleted and verified")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
