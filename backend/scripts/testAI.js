const axios = require('axios');

const testAI = async () => {
  try {
    // First login to get token
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@test.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('Login successful, token:', token.substring(0, 20) + '...');
    
    // Get CSRF token
    const csrfResponse = await axios.get('http://localhost:5000/api/csrf-token', {
      withCredentials: true
    });
    
    const csrfToken = csrfResponse.data.csrfToken;
    console.log('CSRF token:', csrfToken.substring(0, 20) + '...');
    
    // Test AI query
    const aiResponse = await axios.post('http://localhost:5000/api/ai-assistant/query', {
      query: 'how many employees do we have?'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-CSRF-Token': csrfToken,
        'Content-Type': 'application/json'
      },
      withCredentials: true
    });
    
    console.log('AI Response:', aiResponse.data);
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
};

testAI();