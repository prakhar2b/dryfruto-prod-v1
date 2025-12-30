#!/usr/bin/env python3
"""
Seed Initial Data Tests for DryFruto Application
Testing the seed data functionality as requested in the review
"""

import requests
import json
import sys
import os
from typing import Dict, Any

# Get backend URL from frontend .env file
def get_backend_url():
    """Read backend URL from frontend .env file"""
    try:
        frontend_env_path = "/app/frontend/.env"
        with open(frontend_env_path, 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    return line.split('=', 1)[1].strip()
        return "http://localhost:8001"  # fallback
    except Exception:
        return "http://localhost:8001"  # fallback

BACKEND_URL = get_backend_url() + "/api"

class SeedDataTester:
    def __init__(self):
        self.backend_url = BACKEND_URL
        self.session = requests.Session()
        self.test_results = []
        
    def log_test(self, test_name: str, success: bool, details: str = ""):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        self.test_results.append({
            "test": test_name,
            "status": status,
            "success": success,
            "details": details
        })
        print(f"{status}: {test_name}")
        if details:
            print(f"   Details: {details}")
    
    def test_health_check(self) -> bool:
        """Test GET /api/health to ensure backend is running and connected to MongoDB"""
        try:
            response = self.session.get(f"{self.backend_url}/health")
            
            if response.status_code != 200:
                self.log_test("Health Check Endpoint", False, 
                             f"Status code: {response.status_code}, Response: {response.text}")
                return False
            
            data = response.json()
            
            # Check required fields
            if "status" not in data or "database" not in data:
                self.log_test("Health Check Endpoint", False, 
                             f"Missing required fields in response: {data}")
                return False
            
            # Check expected values
            if data["status"] != "healthy":
                self.log_test("Health Check Endpoint", False, 
                             f"Expected status 'healthy', got '{data['status']}'")
                return False
            
            if data["database"] != "connected":
                self.log_test("Health Check Endpoint", False, 
                             f"Expected database 'connected', got '{data['database']}'")
                return False
            
            self.log_test("Health Check Endpoint", True, 
                         f"Backend is healthy and MongoDB is connected: {data}")
            return True
            
        except Exception as e:
            self.log_test("Health Check Endpoint", False, f"Error: {str(e)}")
            return False
    
    def test_seed_data_endpoint(self) -> Dict[str, Any]:
        """Test POST /api/seed-data which resets database with default data"""
        try:
            response = self.session.post(f"{self.backend_url}/seed-data")
            
            if response.status_code != 200:
                self.log_test("Seed Data Endpoint", False, 
                             f"Status code: {response.status_code}, Response: {response.text}")
                return {}
            
            data = response.json()
            
            # Check required fields
            if "message" not in data:
                self.log_test("Seed Data Endpoint", False, "Missing 'message' field in response")
                return {}
            
            # Check for expected response format
            expected_fields = ["categories", "products", "heroSlides", "testimonials", "giftBoxes"]
            
            # Handle both "already seeded" and "seeded successfully" cases
            message = data["message"]
            if "already seeded" in message.lower():
                # For already seeded case, we might not have all counts
                self.log_test("Seed Data Endpoint", True, f"Data already seeded: {message}")
                return data
            elif "seeded successfully" in message.lower():
                # For fresh seeding, check all expected counts
                missing_fields = []
                for field in expected_fields:
                    if field not in data:
                        missing_fields.append(field)
                
                if missing_fields:
                    self.log_test("Seed Data Endpoint", False, 
                                 f"Missing expected count fields: {missing_fields}")
                    return {}
                
                # Verify expected counts
                expected_counts = {
                    "categories": 6,
                    "products": 12,
                    "heroSlides": 3,
                    "testimonials": 6,
                    "giftBoxes": 6
                }
                
                for field, expected_count in expected_counts.items():
                    actual_count = data.get(field, 0)
                    if actual_count != expected_count:
                        self.log_test("Seed Data Endpoint", False, 
                                     f"Expected {expected_count} {field}, got {actual_count}")
                        return {}
                
                self.log_test("Seed Data Endpoint", True, 
                             f"Data seeded successfully with expected counts: {data}")
                return data
            else:
                self.log_test("Seed Data Endpoint", False, f"Unexpected message: {message}")
                return {}
            
        except Exception as e:
            self.log_test("Seed Data Endpoint", False, f"Error: {str(e)}")
            return {}
    
    def test_verify_categories(self) -> bool:
        """Test GET /api/categories - should return 6 categories"""
        try:
            response = self.session.get(f"{self.backend_url}/categories")
            
            if response.status_code != 200:
                self.log_test("Verify Categories Data", False, 
                             f"Status code: {response.status_code}, Response: {response.text}")
                return False
            
            data = response.json()
            
            if not isinstance(data, list):
                self.log_test("Verify Categories Data", False, "Response is not a list")
                return False
            
            if len(data) != 6:
                self.log_test("Verify Categories Data", False, 
                             f"Expected 6 categories, got {len(data)}")
                return False
            
            # Check if each category has required fields
            for i, category in enumerate(data):
                required_fields = ["id", "name", "slug", "image", "icon"]
                for field in required_fields:
                    if field not in category:
                        self.log_test("Verify Categories Data", False, 
                                     f"Category {i} missing field: {field}")
                        return False
            
            self.log_test("Verify Categories Data", True, 
                         f"Successfully verified {len(data)} categories with all required fields")
            return True
            
        except Exception as e:
            self.log_test("Verify Categories Data", False, f"Error: {str(e)}")
            return False
    
    def test_verify_products(self) -> bool:
        """Test GET /api/products - should return 12 products"""
        try:
            response = self.session.get(f"{self.backend_url}/products")
            
            if response.status_code != 200:
                self.log_test("Verify Products Data", False, 
                             f"Status code: {response.status_code}, Response: {response.text}")
                return False
            
            data = response.json()
            
            if not isinstance(data, list):
                self.log_test("Verify Products Data", False, "Response is not a list")
                return False
            
            if len(data) != 12:
                self.log_test("Verify Products Data", False, 
                             f"Expected 12 products, got {len(data)}")
                return False
            
            # Check if each product has required fields
            for i, product in enumerate(data):
                required_fields = ["id", "name", "slug", "category", "basePrice", "image"]
                for field in required_fields:
                    if field not in product:
                        self.log_test("Verify Products Data", False, 
                                     f"Product {i} missing field: {field}")
                        return False
            
            self.log_test("Verify Products Data", True, 
                         f"Successfully verified {len(data)} products with all required fields")
            return True
            
        except Exception as e:
            self.log_test("Verify Products Data", False, f"Error: {str(e)}")
            return False
    
    def test_verify_testimonials(self) -> bool:
        """Test GET /api/testimonials - should return 6 testimonials"""
        try:
            response = self.session.get(f"{self.backend_url}/testimonials")
            
            if response.status_code != 200:
                self.log_test("Verify Testimonials Data", False, 
                             f"Status code: {response.status_code}, Response: {response.text}")
                return False
            
            data = response.json()
            
            if not isinstance(data, list):
                self.log_test("Verify Testimonials Data", False, "Response is not a list")
                return False
            
            if len(data) != 6:
                self.log_test("Verify Testimonials Data", False, 
                             f"Expected 6 testimonials, got {len(data)}")
                return False
            
            # Check if each testimonial has required fields
            for i, testimonial in enumerate(data):
                required_fields = ["id", "name", "review", "avatar"]
                for field in required_fields:
                    if field not in testimonial:
                        self.log_test("Verify Testimonials Data", False, 
                                     f"Testimonial {i} missing field: {field}")
                        return False
            
            self.log_test("Verify Testimonials Data", True, 
                         f"Successfully verified {len(data)} testimonials with all required fields")
            return True
            
        except Exception as e:
            self.log_test("Verify Testimonials Data", False, f"Error: {str(e)}")
            return False
    
    def test_verify_gift_boxes(self) -> bool:
        """Test GET /api/gift-boxes - should return 6 gift boxes"""
        try:
            response = self.session.get(f"{self.backend_url}/gift-boxes")
            
            if response.status_code != 200:
                self.log_test("Verify Gift Boxes Data", False, 
                             f"Status code: {response.status_code}, Response: {response.text}")
                return False
            
            data = response.json()
            
            if not isinstance(data, list):
                self.log_test("Verify Gift Boxes Data", False, "Response is not a list")
                return False
            
            if len(data) != 6:
                self.log_test("Verify Gift Boxes Data", False, 
                             f"Expected 6 gift boxes, got {len(data)}")
                return False
            
            # Check if each gift box has required fields
            for i, gift_box in enumerate(data):
                required_fields = ["id", "name", "image", "price"]
                for field in required_fields:
                    if field not in gift_box:
                        self.log_test("Verify Gift Boxes Data", False, 
                                     f"Gift box {i} missing field: {field}")
                        return False
            
            self.log_test("Verify Gift Boxes Data", True, 
                         f"Successfully verified {len(data)} gift boxes with all required fields")
            return True
            
        except Exception as e:
            self.log_test("Verify Gift Boxes Data", False, f"Error: {str(e)}")
            return False
    
    def test_verify_hero_slides(self) -> bool:
        """Test GET /api/hero-slides - should return 3 hero slides"""
        try:
            response = self.session.get(f"{self.backend_url}/hero-slides")
            
            if response.status_code != 200:
                self.log_test("Verify Hero Slides Data", False, 
                             f"Status code: {response.status_code}, Response: {response.text}")
                return False
            
            data = response.json()
            
            if not isinstance(data, list):
                self.log_test("Verify Hero Slides Data", False, "Response is not a list")
                return False
            
            if len(data) != 3:
                self.log_test("Verify Hero Slides Data", False, 
                             f"Expected 3 hero slides, got {len(data)}")
                return False
            
            # Check if each hero slide has required fields
            for i, slide in enumerate(data):
                required_fields = ["id", "title", "subtitle", "description", "image", "cta"]
                for field in required_fields:
                    if field not in slide:
                        self.log_test("Verify Hero Slides Data", False, 
                                     f"Hero slide {i} missing field: {field}")
                        return False
            
            self.log_test("Verify Hero Slides Data", True, 
                         f"Successfully verified {len(data)} hero slides with all required fields")
            return True
            
        except Exception as e:
            self.log_test("Verify Hero Slides Data", False, f"Error: {str(e)}")
            return False
    
    def test_site_settings_get(self) -> Dict[str, Any]:
        """Test GET /api/site-settings returns the default settings"""
        try:
            response = self.session.get(f"{self.backend_url}/site-settings")
            
            if response.status_code != 200:
                self.log_test("Site Settings GET", False, 
                             f"Status code: {response.status_code}, Response: {response.text}")
                return {}
            
            data = response.json()
            
            # Check if it's a dictionary
            if not isinstance(data, dict):
                self.log_test("Site Settings GET", False, "Response is not a dictionary")
                return {}
            
            # Check for some expected default fields
            expected_fields = ["businessName", "slogan", "phone", "email"]
            missing_fields = []
            
            for field in expected_fields:
                if field not in data:
                    missing_fields.append(field)
            
            if missing_fields:
                self.log_test("Site Settings GET", False, 
                             f"Missing expected fields: {missing_fields}")
                return {}
            
            # Check default values
            if data.get("businessName") != "DryFruto":
                self.log_test("Site Settings GET", False, 
                             f"Expected businessName 'DryFruto', got '{data.get('businessName')}'")
                return {}
            
            if data.get("slogan") != "Live With Health":
                self.log_test("Site Settings GET", False, 
                             f"Expected slogan 'Live With Health', got '{data.get('slogan')}'")
                return {}
            
            self.log_test("Site Settings GET", True, 
                         f"Successfully retrieved site settings with correct default values")
            return data
            
        except Exception as e:
            self.log_test("Site Settings GET", False, f"Error: {str(e)}")
            return {}
    
    def test_site_settings_save(self, current_settings: Dict[str, Any]) -> bool:
        """Test PUT /api/site-settings to verify saving settings works"""
        try:
            if not current_settings:
                self.log_test("Site Settings Save Test", False, "No current settings available")
                return False
            
            # Step 1: Update businessName to "Test Business"
            update_data = {"businessName": "Test Business"}
            
            response = self.session.put(
                f"{self.backend_url}/site-settings",
                json=update_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code != 200:
                self.log_test("Site Settings Save Test", False, 
                             f"Failed to update businessName. Status: {response.status_code}, Response: {response.text}")
                return False
            
            data = response.json()
            
            if data.get("businessName") != "Test Business":
                self.log_test("Site Settings Save Test", False, 
                             f"BusinessName not updated correctly. Expected 'Test Business', got '{data.get('businessName')}'")
                return False
            
            # Step 2: Verify with GET that it was saved
            verify_response = self.session.get(f"{self.backend_url}/site-settings")
            
            if verify_response.status_code != 200:
                self.log_test("Site Settings Save Test", False, 
                             f"Failed to verify saved settings. Status: {verify_response.status_code}")
                return False
            
            verify_data = verify_response.json()
            
            if verify_data.get("businessName") != "Test Business":
                self.log_test("Site Settings Save Test", False, 
                             f"BusinessName not persisted. Expected 'Test Business', got '{verify_data.get('businessName')}'")
                return False
            
            # Step 3: Update back to "DryFruto"
            restore_data = {"businessName": "DryFruto"}
            
            restore_response = self.session.put(
                f"{self.backend_url}/site-settings",
                json=restore_data,
                headers={"Content-Type": "application/json"}
            )
            
            if restore_response.status_code != 200:
                self.log_test("Site Settings Save Test", False, 
                             f"Failed to restore businessName. Status: {restore_response.status_code}")
                return False
            
            restore_result = restore_response.json()
            
            if restore_result.get("businessName") != "DryFruto":
                self.log_test("Site Settings Save Test", False, 
                             f"BusinessName not restored correctly. Expected 'DryFruto', got '{restore_result.get('businessName')}'")
                return False
            
            self.log_test("Site Settings Save Test", True, 
                         "Successfully updated businessName to 'Test Business', verified persistence, and restored to 'DryFruto'")
            return True
            
        except Exception as e:
            self.log_test("Site Settings Save Test", False, f"Error: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all seed data tests"""
        print(f"🌱 Starting Seed Initial Data Tests for DryFruto")
        print(f"Backend URL: {self.backend_url}")
        print("=" * 70)
        
        # Test 1: Health Check
        print("🏥 HEALTH CHECK")
        print("-" * 70)
        if not self.test_health_check():
            print("\n❌ Health check failed. Backend may not be running or MongoDB not connected.")
            print("Stopping tests.")
            return False
        
        # Test 2: Seed Data Endpoint
        print("\n🌱 SEED DATA ENDPOINT")
        print("-" * 70)
        seed_result = self.test_seed_data_endpoint()
        if not seed_result:
            print("\n❌ Seed data endpoint failed.")
            return False
        
        # Test 3-7: Verify Seeded Data
        print("\n📊 VERIFY SEEDED DATA")
        print("-" * 70)
        
        self.test_verify_categories()
        self.test_verify_products()
        self.test_verify_testimonials()
        self.test_verify_gift_boxes()
        self.test_verify_hero_slides()
        
        # Test 8: Site Settings GET
        print("\n⚙️ SITE SETTINGS TESTS")
        print("-" * 70)
        
        current_settings = self.test_site_settings_get()
        
        # Test 9: Site Settings Save
        if current_settings:
            self.test_site_settings_save(current_settings)
        
        # Summary
        print("\n" + "=" * 70)
        print("📊 TEST SUMMARY")
        print("=" * 70)
        
        passed = sum(1 for result in self.test_results if result["success"])
        total = len(self.test_results)
        
        for result in self.test_results:
            print(f"{result['status']}: {result['test']}")
        
        print(f"\n🎯 Results: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 All Seed Initial Data tests passed!")
            return True
        else:
            print("⚠️  Some tests failed. Check details above.")
            return False

def main():
    """Main test execution"""
    tester = SeedDataTester()
    success = tester.run_all_tests()
    
    if not success:
        sys.exit(1)

if __name__ == "__main__":
    main()