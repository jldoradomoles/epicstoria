const fs = require('fs');
const path = require('path');

// Load events.json
const eventsPath = path.join(__dirname, '../public/data/events.json');
const events = JSON.parse(fs.readFileSync(eventsPath, 'utf8'));

console.log('📌 Events in events.json:');
events.slice(0, 5).forEach((e) => {
  console.log(`  - ${e.id}: imageUrl="${e.imageUrl}"`);

  // Check if file exists
  const fullPath = path.join(__dirname, '../public', e.imageUrl);
  const exists = fs.existsSync(fullPath) ? '✓' : '✗';
  console.log(`    File exists: ${exists} (${fullPath})`);
});
