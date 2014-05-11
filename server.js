var pkg = require("./package.json");
var http = require("http");
var port = process.env.PORT || parseInt(process.argv[2], 10) || 4000;
var echos = [];
var total = 0;
var live = 0;


var getEcho = function(id, res) {
  res.writeHead(200, {'Content-Type':'application/json'});
  res.end(JSON.stringify(echos[id], null, 2));
};

var getEchos = function(res) {
  res.writeHead(200, {'Content-Type':'application/json'});
  var ips = {};
  var methods = {};
  var stats = {
    totalLength: 0,
    methods:methods,
    ips:ips
  };
  echos.forEach(function(echo, i) {
    if(!ips[echo.ip]) {
      ips[echo.ip] = [];
    }
    ips[echo.ip].push(i);
    if(!methods[echo.method]) {
      methods[echo.method] = 0;
    }
    methods[echo.method]++;
    stats.totalLength += parseInt(echo.headers['content-length'],10) || 0;
  });
  res.end(JSON.stringify(stats), null, 2);
};

var getProxy = function(xdomain, res) {
  res.writeHead(200, {'Content-Type':'text/html'});
  res.end('<!DOCTYPE HTML>\n'+
          '<script src="'+(xdomain || '//rawgit.com/jpillora/xdomain/gh-pages/dist/0.6/xdomain.js')+'" master="*"></script>');
};

http.createServer(function (req, res) {

  //metas
  if(/^\/echo\/(\d+)\/?$/.test(req.url)) {
    return getEcho(RegExp.$1, res);
  } else if(/^\/echoes\/?$/.test(req.url)) {
    return getEchos(res);
  } else if(/^\/proxy\.html(\?src=(.+))?$/.test(req.url)) {
    return getProxy(RegExp.$2, res);
  }

  //do echo
  var ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  var status = 200;
  if(/\/status\/(\d{3})/.test(req.url))
    status = parseInt(RegExp.$1, 10);

  var delay = 0;
  if(/\/delay\/(\d{1,5})/.test(req.url))
    delay = parseInt(RegExp.$1, 10);
  
  var host = 'http://'+req.headers['host'];
  var referer = /^(https?:\/\/[^\/]+)/.test(req.headers['referer']) ? RegExp.$1 : '*';

  var headers = {
    'content-type':'application/json',
    'echo-server-version': pkg.version,
    'cache-control':'no-cache'
  };

  //apply cors when needed
  if(host !== referer) {
    headers['access-control-allow-credentials'] = true;
    headers['access-control-allow-origin'] = referer;
    if(req.headers['access-control-request-method'])
      headers['access-control-allow-methods'] = req.headers['access-control-request-method'];
    if(req.headers['access-control-request-headers'])
      headers['access-control-allow-headers'] = req.headers['access-control-request-headers'];
    headers['access-control-max-age'] = 0;
  }

  res.writeHead(status, headers);
  total++;
  live++;
  
  //wipe heroku headers
  for(var k in req.headers)
    if(/^x-/.test(k))
      delete req.headers[k];

  var data = {
    ip: ip,
    time: Date.now(),
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
    echos.push(data);
    setTimeout(function() {
      res.end(JSON.stringify(data, null, 2));
      live--;
    }, delay);
  });

}).listen(port, function() {
  console.log("listening on "+port+"...");
});
