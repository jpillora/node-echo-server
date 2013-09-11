

var http = require("http");
var port = process.env.PORT || 4000;
var total = 0;
var live = 0;
var proxyFile = new Buffer('<script src="http://jpillora.com/xdomain/dist/0.5/xdomain.js" master="*"></script>');

http.createServer(function (req, res) {
  total++;
  live++;

  var status = 200;
  if(/\/status\/(\d+)/.test(req.url))
    status = parseInt(RegExp.$1, 10);

  if(req.url === '/proxy.html') {
    res.writeHead(200, {'Content-Type':'text/html'});
    res.end(proxyFile);
    return;
  } else {
    res.writeHead(status, {'Content-Type':'application/json'});
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

    var delay = 0;
    if(/\/delay\/(\d+)/.test(req.url))
      delay = parseInt(RegExp.$1, 10);

    setTimeout(function() {
      res.end(JSON.stringify(data, null, 2));
      live--;
    }, delay);

  });

}).listen(port, function() {
  console.log("listening on "+port+"...");
});