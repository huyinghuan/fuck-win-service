(function() {
  var http;

  http = require("http");

  http.createServer(function(req, res) {
    res.writeHead(200, {
      "Content-Type": "text/plain"
    });
    return res.end("Hello World\n");
  }).listen(1337);

}).call(this);
