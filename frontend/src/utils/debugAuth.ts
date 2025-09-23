/**
 * Token Management Debug Utilities
 * Test functions to debug authentication token issues
 */

// Test token storage and retrieval
export const debugTokenStorage = () => {
  console.log('🔍 [TOKEN DEBUG] Testing token storage...');
  
  // Test setting a token
  const testToken = 'test-token-12345';
  localStorage.setItem('auth_token', testToken);
  console.log('💾 [TOKEN DEBUG] Set test token:', testToken);
  
  // Test retrieving the token
  const retrievedToken = localStorage.getItem('auth_token');
  console.log('📤 [TOKEN DEBUG] Retrieved token:', retrievedToken);
  
  // Test clearing the token
  localStorage.removeItem('auth_token');
  const clearedToken = localStorage.getItem('auth_token');
  console.log('🗑️ [TOKEN DEBUG] After clearing:', clearedToken);
  
  return {
    setToken: testToken,
    retrievedToken,
    clearedToken
  };
};

// Test actual login token handling
export const testLoginTokenHandling = async () => {
  console.log('🔐 [LOGIN TEST] Testing login token handling...');
  
  // Check initial state
  const initialToken = localStorage.getItem('auth_token');
  console.log('🏁 [LOGIN TEST] Initial token state:', initialToken);
  
  // Test login (you'll need to call this manually)
  console.log('📝 [LOGIN TEST] Please perform a login to test token handling');
  
  return { initialToken };
};

// Check current auth state
export const checkAuthState = () => {
  console.log('🔍 [AUTH STATE] Checking current authentication state...');
  
  const token = localStorage.getItem('auth_token');
  const user = localStorage.getItem('user');
  
  console.log('🔑 [AUTH STATE] Token present:', token ? 'Yes' : 'No');
  console.log('👤 [AUTH STATE] User data present:', user ? 'Yes' : 'No');
  
  if (token) {
    console.log('🔑 [AUTH STATE] Token preview:', token.substring(0, 30) + '...');
  }
  
  if (user) {
    try {
      const userData = JSON.parse(user);
      console.log('👤 [AUTH STATE] User data:', userData);
    } catch (error) {
      console.log('❌ [AUTH STATE] Invalid user data in localStorage');
    }
  }
  
  return { token, user };
};

// Make functions available globally for browser console testing
if (typeof window !== 'undefined') {
  (window as any).debugTokenStorage = debugTokenStorage;
  (window as any).testLoginTokenHandling = testLoginTokenHandling;
  (window as any).checkAuthState = checkAuthState;
}