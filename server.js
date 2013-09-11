

var http = require("http");
var port = process.env.PORT || 4000;
var total = 0;
var live = 0;
var proxyFile = new Buffer('<script src="http://jpillora.com/xdomain/dist/0/xdomain.js" master="*"></script>');

http.createServer(function (req, res) {
  total++;
  live++;

  if(req.url === '/proxy.html') {
    res.writeHead(200, {'Content-Type':'text/html'});
    res.end(proxyFile);
    return;
  }

  var data = {
    ip: req.connection.remoteAddress,
    method: req.method,
    url: req.url,
    body: "",
    headers: req.headers,
    meta: {
      total: total,
      live: live
    }
  };

  req.on('data', function(buffer) {
    data.body += buffer.toString();
  });

  req.on('end', function() {
    res.end(JSON.stringify(data, null, 2));
    live--;
  });

}).listen(port, function() {
  console.log("listening on "+port+"...");
});