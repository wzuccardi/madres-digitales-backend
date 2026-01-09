// Test script to debug role conversion
const testRole = 'SUPER_ADMIN';

console.log('Original role:', testRole);
console.log('After toLowerCase():', testRole.toLowerCase());

// Test the actual logic from auth controller
const authUserRole = 'SUPER_ADMIN';
const convertedRole = authUserRole?.toLowerCase() || authUserRole;
console.log('\nActual conversion result:', convertedRole);