var pkg = require("./package.json");
var http = require("http");
var port = process.env.PORT || parseInt(process.argv[2], 10) || 4000;
var datas = [];
var total = 0;
var live = 0;

http.createServer(function (req, res) {

  var ip = req.connection.remoteAddress;

  var status = 200;
  if(/\/status\/(\d{3})/.test(req.url))
    status = parseInt(RegExp.$1, 10);

  var delay = 0;
  if(/\/delay\/(\d{1,5})/.test(req.url))
    delay = parseInt(RegExp.$1, 10);

  if(/^\/get-echo\/(\d+)$/.test(req.url)) {
    res.writeHead(200, {'Content-Type':'application/json'});
    res.end(JSON.stringify(datas[RegExp.$1], null, 2));
    return;
  }
  
  if(/^\/proxy\.html(\?src=(.+))?$/.test(req.url)) {
    res.writeHead(200, {'Content-Type':'text/html'});
    res.end('<!DOCTYPE HTML>\n'+
            '<script src="'+(RegExp.$2 || 'http://jpillora.com/xdomain/dist/0.6/xdomain.js')+'" master="*"></script>');
    return;
  }
  
  var origin = req.headers['origin'];
  if(!origin)
    origin = /(^https?:\/\/[^\/]+)/.test(req.headers['referer']) ? RegExp.$1 : '*';

  res.writeHead(status, {
    'content-type':'application/json',
    'echo-server-version': pkg.version,
    'access-control-allow-credentials':true,
    'access-control-allow-origin': origin,
    'access-control-max-age':0,
    'cache-control':'no-cache'
  });
  total++;
  live++;
  
  var data = {
    ip: ip,
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
    datas.push(data);
    setTimeout(function() {
      res.end(JSON.stringify(data, null, 2));
      live--;
    }, delay);
  });

}).listen(port, function() {
  console.log("listening on "+port+"...");
});
