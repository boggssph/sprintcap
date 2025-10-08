const http = require('http');
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('ok');
});
const port = process.env.PORT || 5000;
server.listen(port, '0.0.0.0', () => {
  console.log(`test server listening ${port}`);
});
