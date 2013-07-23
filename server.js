

var http = require("http");
var total = 0;
var live = 0;

http.createServer(function (req, res) {
  total++;
  live++;

  res.writeHead(Math.random() < 0.05 ? 403 : 200);

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

}).listen(process.env.PORT || 3000, function() {
  console.log("listening...");
});