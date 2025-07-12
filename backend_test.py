#!/usr/bin/env python3
"""
Backend API Test Suite for Kurdish Table Management System
Tests all CRUD operations, MongoDB integration, and Kurdish text handling
"""

import requests
import json
import sys
import time
from urllib.parse import urljoin

# Configuration
BASE_URL = "https://ca069b29-0ebf-4f39-a496-f681dfb723f1.preview.emergentagent.com"
API_BASE = f"{BASE_URL}/api"

def test_get_tables():
    """Test GET /api/tables - Verify all 7 tables with Kurdish data are returned"""
    print("\n=== Testing GET /api/tables ===")
    
    try:
        response = requests.get(f"{API_BASE}/tables", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAILED: Expected status 200, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
        data = response.json()
        print(f"Response keys: {list(data.keys())}")
        
        # Verify structure
        if 'tables' not in data:
            print("❌ FAILED: 'tables' key missing from response")
            return False
            
        tables = data['tables']
        print(f"Number of tables returned: {len(tables)}")
        
        # Verify we have 7 tables as expected
        if len(tables) != 7:
            print(f"❌ FAILED: Expected 7 tables, got {len(tables)}")
            return False
            
        # Verify Kurdish text in table names
        kurdish_table_names = [
            "0-7 پۆل", "0-6 پۆل", "0-5 پۆل", "پۆل نەناسراو", 
            "دەركەی فۆرج", "مەفەرەزە 5-0", "0-4 پۆل"
        ]
        
        returned_names = [table['name'] for table in tables]
        print(f"Table names: {returned_names}")
        
        for expected_name in kurdish_table_names:
            if expected_name not in returned_names:
                print(f"❌ FAILED: Missing expected table '{expected_name}'")
                return False
                
        # Verify table structure
        for i, table in enumerate(tables):
            if 'name' not in table or 'columns' not in table or 'data' not in table:
                print(f"❌ FAILED: Table {i} missing required fields")
                return False
                
            # Verify Kurdish text in data
            if table['data']:
                sample_row = table['data'][0]
                if len(sample_row) >= 1:
                    print(f"Sample Kurdish text from {table['name']}: {sample_row[0]}")
                    
        # Verify metadata
        if 'metadata' in data:
            metadata = data['metadata']
            print(f"Metadata: {metadata}")
            
        print("✅ GET /api/tables test PASSED")
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"❌ FAILED: Request error - {e}")
        return False
    except json.JSONDecodeError as e:
        print(f"❌ FAILED: JSON decode error - {e}")
        return False
    except Exception as e:
        print(f"❌ FAILED: Unexpected error - {e}")
        return False

def test_put_tables():
    """Test PUT /api/tables - Test updating table data"""
    print("\n=== Testing PUT /api/tables ===")
    
    try:
        # First get current data
        response = requests.get(f"{API_BASE}/tables", timeout=10)
        if response.status_code != 200:
            print("❌ FAILED: Could not get current tables for PUT test")
            return False
            
        data = response.json()
        tables = data['tables']
        
        if not tables:
            print("❌ FAILED: No tables available for PUT test")
            return False
            
        # Test updating the first table
        test_table = tables[0]
        table_name = test_table['name']
        original_data = test_table['data'].copy()
        
        # Add a new row with Kurdish text
        new_row = ["تاقیکردنەوە تەست", "ن.ز.١٠"]
        updated_data = original_data + [new_row]
        
        # Send PUT request
        put_payload = {
            "tableName": table_name,
            "data": updated_data
        }
        
        response = requests.put(
            f"{API_BASE}/tables",
            json=put_payload,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        print(f"PUT Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAILED: Expected status 200, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
        put_response = response.json()
        if not put_response.get('success'):
            print(f"❌ FAILED: PUT response indicates failure: {put_response}")
            return False
            
        # Verify the update by getting tables again
        time.sleep(1)  # Brief delay for database consistency
        response = requests.get(f"{API_BASE}/tables", timeout=10)
        if response.status_code != 200:
            print("❌ FAILED: Could not verify PUT update")
            return False
            
        updated_tables = response.json()['tables']
        updated_table = next((t for t in updated_tables if t['name'] == table_name), None)
        
        if not updated_table:
            print(f"❌ FAILED: Could not find updated table '{table_name}'")
            return False
            
        if len(updated_table['data']) != len(updated_data):
            print(f"❌ FAILED: Data length mismatch after PUT")
            return False
            
        # Check if our test row was added
        if new_row not in updated_table['data']:
            print(f"❌ FAILED: Test row not found in updated data")
            return False
            
        print(f"✅ Successfully added Kurdish test row: {new_row}")
        
        # Restore original data
        restore_payload = {
            "tableName": table_name,
            "data": original_data
        }
        
        requests.put(
            f"{API_BASE}/tables",
            json=restore_payload,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        print("✅ PUT /api/tables test PASSED")
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"❌ FAILED: Request error - {e}")
        return False
    except Exception as e:
        print(f"❌ FAILED: Unexpected error - {e}")
        return False

def test_post_tables():
    """Test POST /api/tables - Test creating new tables"""
    print("\n=== Testing POST /api/tables ===")
    
    try:
        # Create a new table with Kurdish data
        new_table = {
            "name": "تاقیکردنەوەی نوێ",
            "columns": ["ناو", "ڕەتبە"],
            "data": [
                ["تاقیکار یەکەم", "ن.ز.٥"],
                ["تاقیکار دووەم", "ن.ز.٦"]
            ]
        }
        
        response = requests.post(
            f"{API_BASE}/tables",
            json=new_table,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        print(f"POST Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAILED: Expected status 200, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
        post_response = response.json()
        if not post_response.get('success'):
            print(f"❌ FAILED: POST response indicates failure: {post_response}")
            return False
            
        # Verify the new table was created
        time.sleep(1)  # Brief delay for database consistency
        response = requests.get(f"{API_BASE}/tables", timeout=10)
        if response.status_code != 200:
            print("❌ FAILED: Could not verify POST creation")
            return False
            
        tables = response.json()['tables']
        created_table = next((t for t in tables if t['name'] == new_table['name']), None)
        
        if not created_table:
            print(f"❌ FAILED: New table '{new_table['name']}' not found")
            return False
            
        # Verify table structure and data
        if created_table['columns'] != new_table['columns']:
            print(f"❌ FAILED: Column mismatch in created table")
            return False
            
        if created_table['data'] != new_table['data']:
            print(f"❌ FAILED: Data mismatch in created table")
            return False
            
        print(f"✅ Successfully created table: {new_table['name']}")
        print(f"✅ Kurdish text preserved: {created_table['data'][0][0]}")
        
        print("✅ POST /api/tables test PASSED")
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"❌ FAILED: Request error - {e}")
        return False
    except Exception as e:
        print(f"❌ FAILED: Unexpected error - {e}")
        return False

def test_delete_tables():
    """Test DELETE /api/tables - Test deleting tables"""
    print("\n=== Testing DELETE /api/tables ===")
    
    try:
        # Get current tables to find our test table
        response = requests.get(f"{API_BASE}/tables", timeout=10)
        if response.status_code != 200:
            print("❌ FAILED: Could not get tables for DELETE test")
            return False
            
        tables = response.json()['tables']
        test_table_name = "تاقیکردنەوەی نوێ"
        
        # Check if test table exists
        test_table = next((t for t in tables if t['name'] == test_table_name), None)
        if not test_table:
            print(f"❌ FAILED: Test table '{test_table_name}' not found for deletion")
            return False
            
        original_count = len(tables)
        
        # Delete the test table
        delete_payload = {
            "tableName": test_table_name
        }
        
        response = requests.delete(
            f"{API_BASE}/tables",
            json=delete_payload,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        print(f"DELETE Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ FAILED: Expected status 200, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
        delete_response = response.json()
        if not delete_response.get('success'):
            print(f"❌ FAILED: DELETE response indicates failure: {delete_response}")
            return False
            
        # Verify the table was deleted
        time.sleep(1)  # Brief delay for database consistency
        response = requests.get(f"{API_BASE}/tables", timeout=10)
        if response.status_code != 200:
            print("❌ FAILED: Could not verify DELETE operation")
            return False
            
        updated_tables = response.json()['tables']
        deleted_table = next((t for t in updated_tables if t['name'] == test_table_name), None)
        
        if deleted_table:
            print(f"❌ FAILED: Table '{test_table_name}' still exists after DELETE")
            return False
            
        if len(updated_tables) != original_count - 1:
            print(f"❌ FAILED: Table count mismatch after DELETE")
            return False
            
        print(f"✅ Successfully deleted table: {test_table_name}")
        
        print("✅ DELETE /api/tables test PASSED")
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"❌ FAILED: Request error - {e}")
        return False
    except Exception as e:
        print(f"❌ FAILED: Unexpected error - {e}")
        return False

def test_error_handling():
    """Test error handling for invalid requests"""
    print("\n=== Testing Error Handling ===")
    
    try:
        # Test invalid endpoint
        response = requests.get(f"{API_BASE}/invalid", timeout=10)
        if response.status_code != 404:
            print(f"❌ FAILED: Expected 404 for invalid endpoint, got {response.status_code}")
            return False
        print("✅ Invalid endpoint returns 404")
        
        # Test PUT with invalid table name
        invalid_put = {
            "tableName": "نەبوونی تەبڵۆ",
            "data": []
        }
        response = requests.put(
            f"{API_BASE}/tables",
            json=invalid_put,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        # Should still return 200 but not actually update anything
        if response.status_code == 200:
            print("✅ PUT with invalid table name handled gracefully")
        
        # Test DELETE with invalid table name
        invalid_delete = {
            "tableName": "نەبوونی تەبڵۆ"
        }
        response = requests.delete(
            f"{API_BASE}/tables",
            json=invalid_delete,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        # Should still return 200 but not actually delete anything
        if response.status_code == 200:
            print("✅ DELETE with invalid table name handled gracefully")
        
        print("✅ Error handling tests PASSED")
        return True
        
    except Exception as e:
        print(f"❌ FAILED: Error handling test failed - {e}")
        return False

def test_unicode_kurdish_handling():
    """Test Unicode/Kurdish text handling specifically"""
    print("\n=== Testing Unicode/Kurdish Text Handling ===")
    
    try:
        # Test with complex Kurdish text including various characters
        complex_kurdish_text = "ئەحمەد کوڕی عەلی لە گوندی سەرچاوە دەژی"
        complex_rank = "ن.ز.١٥"
        
        # Get a table to test with
        response = requests.get(f"{API_BASE}/tables", timeout=10)
        if response.status_code != 200:
            print("❌ FAILED: Could not get tables for Unicode test")
            return False
            
        tables = response.json()['tables']
        if not tables:
            print("❌ FAILED: No tables available for Unicode test")
            return False
            
        test_table = tables[0]
        table_name = test_table['name']
        original_data = test_table['data'].copy()
        
        # Add row with complex Kurdish text
        unicode_row = [complex_kurdish_text, complex_rank]
        updated_data = original_data + [unicode_row]
        
        # Update table
        put_payload = {
            "tableName": table_name,
            "data": updated_data
        }
        
        response = requests.put(
            f"{API_BASE}/tables",
            json=put_payload,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        if response.status_code != 200:
            print(f"❌ FAILED: Unicode PUT failed with status {response.status_code}")
            return False
            
        # Verify Unicode preservation
        time.sleep(1)
        response = requests.get(f"{API_BASE}/tables", timeout=10)
        if response.status_code != 200:
            print("❌ FAILED: Could not verify Unicode preservation")
            return False
            
        updated_tables = response.json()['tables']
        updated_table = next((t for t in updated_tables if t['name'] == table_name), None)
        
        if not updated_table:
            print("❌ FAILED: Could not find table after Unicode update")
            return False
            
        # Check if Unicode text was preserved exactly
        found_unicode_row = None
        for row in updated_table['data']:
            if len(row) >= 2 and row[0] == complex_kurdish_text and row[1] == complex_rank:
                found_unicode_row = row
                break
                
        if not found_unicode_row:
            print(f"❌ FAILED: Unicode text not preserved correctly")
            print(f"Expected: {unicode_row}")
            print(f"Available rows: {updated_table['data']}")
            return False
            
        print(f"✅ Unicode Kurdish text preserved: {found_unicode_row[0]}")
        print(f"✅ Unicode Kurdish rank preserved: {found_unicode_row[1]}")
        
        # Restore original data
        restore_payload = {
            "tableName": table_name,
            "data": original_data
        }
        requests.put(
            f"{API_BASE}/tables",
            json=restore_payload,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        print("✅ Unicode/Kurdish text handling test PASSED")
        return True
        
    except Exception as e:
        print(f"❌ FAILED: Unicode test failed - {e}")
        return False

def main():
    """Run all backend tests"""
    print("🚀 Starting Kurdish Table Management Backend API Tests")
    print(f"Testing against: {API_BASE}")
    
    tests = [
        ("GET Tables", test_get_tables),
        ("PUT Tables", test_put_tables),
        ("POST Tables", test_post_tables),
        ("DELETE Tables", test_delete_tables),
        ("Error Handling", test_error_handling),
        ("Unicode/Kurdish Text", test_unicode_kurdish_handling)
    ]
    
    results = []
    
    for test_name, test_func in tests:
        print(f"\n{'='*60}")
        print(f"Running: {test_name}")
        print(f"{'='*60}")
        
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ FAILED: {test_name} - Unexpected error: {e}")
            results.append((test_name, False))
    
    # Summary
    print(f"\n{'='*60}")
    print("TEST SUMMARY")
    print(f"{'='*60}")
    
    passed = 0
    failed = 0
    
    for test_name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{test_name}: {status}")
        if result:
            passed += 1
        else:
            failed += 1
    
    print(f"\nTotal: {len(results)} tests")
    print(f"Passed: {passed}")
    print(f"Failed: {failed}")
    
    if failed == 0:
        print("\n🎉 ALL TESTS PASSED! Backend API is working correctly.")
        return 0
    else:
        print(f"\n⚠️  {failed} test(s) failed. Please check the issues above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())