/**
 * Manual Authentication Test
 * Copy and paste this into browser console to test auth flow manually
 */

// Simulate the exact login response you received
const testAuthResponse = {
  "user": {
    "id": "68d0f165f9431ff3af2b2eaf",
    "email": "john.doe.test534820112@example.com",
    "username": "johndoetest534820112_eg5v8r",
    "role": "student",
    "isActive": true,
    "emailVerified": false,
    "profile": null
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OGQwZjE2NWY5NDMxZmYzYWYyYjJlYWYiLCJlbWFpbCI6ImpvaG4uZG9lLnRlc3Q1MzQ4MjAxMTJAZXhhbXBsZS5jb20iLCJyb2xlIjoic3R1ZGVudCIsImlhdCI6MTc1ODUyNTAxOCwiZXhwIjoxNzU4NTI1OTE4fQ.dKFEmSa-Fqzc32BLcQS0eK4zBn4Ol0fKk9ka7AhAfgM",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OGQwZjE2NWY5NDMxZmYzYWYyYjJlYWYiLCJ0b2tlbklkIjoiMzk1YzcwODktNTIyYi00OTkxLThhZTEtNzY0NTA4NmJhNWY3IiwiaWF0IjoxNzU4NTI1MDE4LCJleHAiOjE3NTkxMjk4MTh9.IcZtPHsSUwW26UUNpjzNL4V2aTscvFSbFwRFx_yFu9g",
  "message": "Login successful"
};

// Function to manually test token storage
function manualTokenTest() {
  console.log('🧪 [MANUAL TEST] Starting manual authentication token test...');
  
  // Clear any existing auth data
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
  console.log('🗑️ [MANUAL TEST] Cleared existing auth data');
  
  // Test the exact response structure
  console.log('📥 [MANUAL TEST] Testing with your exact login response...');
  console.log('🔍 [MANUAL TEST] Response structure:', testAuthResponse);
  
  // Check if accessToken exists in response
  console.log('🔑 [MANUAL TEST] AccessToken present:', !!testAuthResponse.accessToken);
  console.log('🔑 [MANUAL TEST] AccessToken preview:', testAuthResponse.accessToken.substring(0, 30) + '...');
  
  // Manually store the token (simulating what the auth service should do)
  localStorage.setItem('auth_token', testAuthResponse.accessToken);
  console.log('💾 [MANUAL TEST] Stored token in localStorage');
  
  // Store user data
  localStorage.setItem('user', JSON.stringify(testAuthResponse.user));
  console.log('👤 [MANUAL TEST] Stored user data in localStorage');
  
  // Verify storage
  const storedToken = localStorage.getItem('auth_token');
  const storedUser = localStorage.getItem('user');
  
  console.log('✅ [MANUAL TEST] Verification Results:');
  console.log('🔑 [MANUAL TEST] Token stored correctly:', storedToken === testAuthResponse.accessToken);
  console.log('👤 [MANUAL TEST] User stored correctly:', !!storedUser);
  
  // Test token retrieval (simulating API service)
  const retrievedToken = localStorage.getItem('auth_token');
  console.log('📤 [MANUAL TEST] Retrieved token preview:', retrievedToken?.substring(0, 30) + '...');
  
  return {
    tokenStored: !!storedToken,
    userStored: !!storedUser,
    tokenMatches: storedToken === testAuthResponse.accessToken
  };
}

// Function to test authentication headers
function testAuthHeaders() {
  console.log('🔒 [AUTH HEADERS] Testing authentication headers...');
  
  const token = localStorage.getItem('auth_token');
  if (!token) {
    console.log('❌ [AUTH HEADERS] No token found in localStorage');
    return false;
  }
  
  console.log('🔑 [AUTH HEADERS] Token found, testing header format...');
  const authHeader = `Bearer ${token}`;
  console.log('📋 [AUTH HEADERS] Authorization header:', authHeader.substring(0, 50) + '...');
  
  return true;
}

// Make available globally
if (typeof window !== 'undefined') {
  (window as any).manualTokenTest = manualTokenTest;
  (window as any).testAuthHeaders = testAuthHeaders;
  (window as any).testAuthResponse = testAuthResponse;
  
  console.log('🛠️ [DEBUG TOOLS] Manual auth testing tools loaded!');
  console.log('📝 [DEBUG TOOLS] Available functions:');
  console.log('   - manualTokenTest() - Test token storage with your exact response');
  console.log('   - testAuthHeaders() - Test authentication header format');
  console.log('   - checkAuthState() - Check current auth state');
  console.log('   - debugTokenStorage() - Test basic localStorage functionality');
}