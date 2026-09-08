const http = require('http');

const slugs = ['miguel-angel-y-la-capilla-sixtina-1512', 'La-voz-de-la-tierra'];

async function checkEvent(slug) {
  return new Promise((resolve) => {
    const opts = { hostname: 'localhost', port: 3000, path: `/api/events/${slug}`, method: 'GET' };
    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log(`\n📌 Event: ${slug}`);
          console.log(`   imageUrl: ${json.imageUrl}`);
          resolve();
        } catch (e) {
          console.error(`Error parsing: ${e.message}`);
          resolve();
        }
      });
    });
    req.on('error', (e) => {
      console.error(`Request error for ${slug}: ${e.message}`);
      resolve();
    });
    req.end();
  });
}

(async () => {
  for (const slug of slugs) {
    await checkEvent(slug);
  }
})();
