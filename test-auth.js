// Simple test script to verify authentication setup
// Run with: node test-auth.js

const testSignup = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'TestPassword123'
      }),
    });

    const result = await response.json();
    console.log('Signup test result:', result);
  } catch (error) {
    console.error('Signup test failed:', error);
  }
};

const testSignin = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'TestPassword123'
      }),
    });

    const result = await response.json();
    console.log('Signin test result:', result);
  } catch (error) {
    console.error('Signin test failed:', error);
  }
};

// Run tests
console.log('Testing authentication setup...');
testSignup().then(() => testSignin());