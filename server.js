var http = require("http");
var port = process.env.PORT || parseInt(process.argv[2], 10) || 4000;
var total = 0;
var live = 0;
var proxyFile = new Buffer('<!DOCTYPE HTML>\n<script src="http://jpillora.com/xdomain/dist/0.5/xdomain.js" master="*"></script>');

http.createServer(function (req, res) {

  var status = 200;
  if(/\/status\/(\d{3})/.test(req.url))
    status = parseInt(RegExp.$1, 10);

  var delay = 0;
  if(/\/delay\/(\d{1,5})/.test(req.url))
    delay = parseInt(RegExp.$1, 10);

  if(req.url === '/proxy.html') {
    res.writeHead(200, {'Content-Type':'text/html'});
    res.end(proxyFile);
    return;
  } else {
    res.writeHead(status, {'Content-Type':'application/json'});
  }

  total++;
  live++;
  
  var data = {
    ip: req.connection.remoteAddress,
    method: req.method,
    url: req.url,
    body: "",
    headers: req.headers,
    meta: {
      total: total,
      live: live,
      status: status,
      delay: delay
    }
  };

  req.on('data', function(buffer) {
    data.body += buffer.toString();
  });

  req.on('end', function() {
    setTimeout(function() {
      res.end(JSON.stringify(data, null, 2));
      live--;
    }, delay);
  });

}).listen(port, function() {
  console.log("listening on "+port+"...");
});
