const http = require('http');

const opts = { hostname: 'localhost', port: 3000, path: '/api/events?limit=1', method: 'GET' };
const req = http.request(opts, (res) => {
  let data = '';
  res.on('data', (chunk) => (data += chunk));
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      const event = Array.isArray(json) ? json[0] : json;
      console.log(JSON.stringify(event, null, 2));
    } catch (e) {
      console.log('Raw:', data);
    }
  });
});
req.on('error', (e) => console.error(e.message));
req.end();
