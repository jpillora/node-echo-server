var querystring = require('querystring');
var mongoose = require('mongoose');
var db = mongoose.connection;
var Echo = mongoose.model('Echo', {
	ip: String,
	domain: String,
	method: String,
	url: String,
	body: String,
	host: String,
	userAgent: String,
	referer: String
});
var connecting = false;
var disabled = false;

function init() {
	var uri = process.env.MONGOLAB_URI;
	if (!uri) {
		disabled = true;
		return;
	}
	db.on('error', function(err) {
		console.error('mongo error %s', err);
	});
	db.once('open', function() {
		console.log('Connected to Mongolab');
	});
	mongoose.connect(uri);
	connecting = true;
}

function msg2doc(msg) {
	//force domains to be a string
	var domains = msg.domains;
	if (domains && domains instanceof Array) domains = domains.join(",");
	return {
		ip: msg.ip,
		domains: domains,
		method: msg.method,
		url: msg.url,
		body: msg.body.length < 1000 ? msg.body : msg.body.substr(0, 1000),
		host: msg.headers.host,
		userAgent: msg.headers["user-agent"],
		referer: msg.headers.referer || msg.headers.origin
	};
}
exports.process = function(msg) {
	if (!connecting) init();
	if (disabled) return;
	//dont insert load tests
	if (/^load-tester/.test(msg.headers["user-agent"])) return;
	//add to db
	new Echo(msg2doc(msg)).save(function(err) {
		if (err) return console.error('error saving document');
	});
};

function stringify(obj) {
	var str = JSON.stringify(obj || null, 0, 2);
	if (typeof str !== "string") str = "{}";
	return new Buffer(str);
}
exports.fetch = function(req, res) {
	if (!connecting) init();
	if (disabled) return res.end("<disabled>");
	var query = querystring.parse(/\?(.+)/.test(req.url) ? RegExp.$1 : '');
	try {
		for (var k in query)
			if (/^\/.+\/$/.test(k)) query[k] = new RegExp(k);
	} catch (e) {
		return res.end("regex error: " + e);
	}
	res.writeHead(200, {
		"content-type": "application/json"
	});
	var obj = null;
	res.write("[");
	Echo.find(query).limit(1000).stream().on('data', function(doc) {
		if (obj !== null) res.write(stringify(obj) + ",");
		obj = doc.toObject();
		for (var k in obj)
			if (k[0] === "_") delete obj[k];
	}).on('error', function(err) {
		res.write(JSON.stringify({
			err: err.toString()
		}, 0, 2));
	}).on('close', function() {
		if (obj !== null) res.write(stringify(obj));
		res.write("]");
	});
};