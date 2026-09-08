const http = require('http');

const opts = { hostname: 'localhost', port: 3000, path: '/api/events', method: 'GET' };
const req = http.request(opts, (res) => {
  let data = '';
  res.on('data', (chunk) => (data += chunk));
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      if (Array.isArray(json)) {
        const first3 = json.slice(0, 3);
        console.log('📌 First 3 events:');
        first3.forEach((e) => {
          console.log(`  - ${e.slug || e.id}: imageUrl="${e.imageUrl}"`);
        });
      } else {
        console.log(JSON.stringify(json, null, 2));
      }
    } catch (e) {
      console.error(`Parse error: ${e.message}`);
      console.log('Raw response:', data.substring(0, 500));
    }
  });
});
req.on('error', (e) => {
  console.error('Request error:', e.message);
});
req.end();
