const http = require('http');

http.createServer(function (req, res) {
  res.write("The bot is online! Visit the website at: https://nerdmusic.repl.co");
  res.end();
}).listen(8080);
