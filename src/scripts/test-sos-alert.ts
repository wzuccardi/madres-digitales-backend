import http from 'http';

async function testSOSAlert() {
  try {
    console.log('🚨 Testing SOS Alert API...');

    const data = JSON.stringify({
      gestanteId: 'a93249cf-9164-4ea7-a701-e105a9958ad4',
      coordenadas: [-75.5171328, 10.4562688]
    });

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/alertas/emergencia',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjhkZjZhOTM2LTcyNzctNGY4Yy05YzIwLTI0YTg0NDMyMDE0NiIsImVtYWlsIjoiYWRtaW5AbWFkcmVzZGlnaXRhbGVzLmNvbSIsInJvbCI6ImFkbWluIiwiaWF0IjoxNzU5MTA0NjQ3LCJleHAiOjE3NTkxOTEwNDd9.P4xlGHLrauAQvTx8RUzT7dmWgy3jJzxlMTk17gpiSWU'
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 201) {
          console.log('✅ SOS Alert created successfully!');
          console.log('Response:', JSON.parse(responseData));
        } else {
          console.error('❌ Error creating SOS alert:');
          console.error('Status:', res.statusCode);
          console.error('Data:', responseData);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request error:', error.message);
    });

    req.write(data);
    req.end();

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

testSOSAlert().then(() => {
  console.log('Test completed');
  process.exit(0);
}).catch((error) => {
  console.error('Test failed:', error);
  process.exit(1);
});

// Timeout para evitar que el script se cuelgue
setTimeout(() => {
  console.log('⏰ Test timeout');
  process.exit(1);
}, 10000);
