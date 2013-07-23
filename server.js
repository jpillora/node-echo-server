

var http = require("http");
var total = 0;
var live = 0;

http.createServer(function (req, res) {
  total++;
  live++;

  setTimeout(function() {

    res.writeHead(200);

    var data = {
      method: req.method,
      url: req.url,
      body: ""
    };

    req.on('data', function(buffer) {
      data.body += buffer.toString();
    });

    req.on('end', function() {
      res.end(JSON.stringify(data, null, 2));
      live--;
      console.log(live, total);
    });

  }, 100+Math.floor(Math.random()*50));

}).listen(process.env.PORT || 3000, function() {
  console.log("listening...");
});