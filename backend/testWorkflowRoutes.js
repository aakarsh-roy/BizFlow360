// Test script to verify workflow API endpoints are working
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000';

async function testWorkflowEndpoints() {
  console.log('Testing Workflow API Endpoints...\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health check...');
    const healthResponse = await axios.get(`${API_BASE_URL}/api/health`);
    console.log('✅ Health check passed');
    console.log('Available modules:', healthResponse.data.modules.slice(0, 3));

    // Test 2: Get process definitions (without auth - should fail with 401)
    console.log('\n2. Testing process definitions endpoint (no auth)...');
    try {
      const definitionsResponse = await axios.get(`${API_BASE_URL}/api/workflows`);
      console.log('⚠️  Unexpected success - authentication might be disabled');
      console.log('Process definitions count:', definitionsResponse.data.data?.processDefinitions?.length || 0);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Authentication required (401) - security working correctly');
      } else if (error.response?.status === 404) {
        console.log('❌ Routes not found (404) - workflow routes not registered properly');
      } else {
        console.log('⚠️  Unexpected error:', error.response?.status, error.response?.data?.message);
      }
    }

    // Test 3: Test process instances endpoint (without auth - should fail with 401)
    console.log('\n3. Testing process instances endpoint (no auth)...');
    try {
      const instancesResponse = await axios.get(`${API_BASE_URL}/api/workflows/instances`);
      console.log('⚠️  Unexpected success - authentication might be disabled');
      console.log('Process instances count:', instancesResponse.data.data?.processInstances?.length || 0);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Authentication required (401) - security working correctly');
      } else if (error.response?.status === 404) {
        console.log('❌ Routes not found (404) - workflow routes not registered properly');
      } else {
        console.log('⚠️  Unexpected error:', error.response?.status, error.response?.data?.message);
      }
    }

    // Test 4: Test start process endpoint (should fail with 404 for invalid ID or 401 for auth)
    console.log('\n4. Testing start process endpoint (no auth)...');
    try {
      const startResponse = await axios.post(`${API_BASE_URL}/api/workflows/test123/start`, {
        variables: { test: true }
      });
      console.log('⚠️  Unexpected success');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Authentication required (401) - security working correctly');
      } else if (error.response?.status === 404) {
        if (error.response.data.message === 'Process definition not found') {
          console.log('✅ Route found but process definition not found - routes working');
        } else {
          console.log('❌ Routes not found (404) - workflow routes not registered properly');
        }
      } else {
        console.log('⚠️  Unexpected error:', error.response?.status, error.response?.data?.message);
      }
    }

  } catch (error) {
    console.error('❌ Connection error:', error.message);
    console.log('Make sure the backend server is running on port 5000');
  }

  console.log('\n=== Test Results Summary ===');
  console.log('If you see "Authentication required (401)" for workflows endpoints,');
  console.log('the routes are properly registered and the issue is authentication.');
  console.log('If you see "Routes not found (404)", the routes are not registered properly.');
}

testWorkflowEndpoints();