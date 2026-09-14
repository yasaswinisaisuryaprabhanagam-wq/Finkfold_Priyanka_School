const http = require('http');

http.get('http://localhost:3005/dashboard?view=faculty', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Data length:', data.length);
    const sample = data.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 1500);
    console.log('Text content sample:');
    console.log(sample);
  });
});
