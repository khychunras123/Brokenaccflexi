const https = require('https');

const options = {
  hostname: 'oder-backend-2.onrender.com',
  path: '/api/products',
  method: 'GET',
  headers: {
    'X-API-Key': 'my-secret-key-ChanRas-123'
  }
};

const req = https.request(options, (res) => {
  console.log('Status:', res.statusCode);
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('Body:', data);
  });
});

req.on('error', (e) => {
  console.error('Error:', e);
});

req.end();
