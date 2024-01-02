
var http = require('http');
http.createServer(function (req, res) {
  res.write("Waiting for ... ... ...");
  res.end();
}).listen(8080);