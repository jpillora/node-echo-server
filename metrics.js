
var mongoose = require('mongoose');
var db = mongoose.connection;

var Echo = mongoose.model('Echo', {
	ip: String,
	domains: [String],
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
	if(!uri) {
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
	//force domains to be an array
	var domains = [];
	if(msg.domains)
		if(msg.domains instanceof Array)
			domains = msg.domains;
		else
			domains.push(msg.domains);
	return {
		ip: msg.ip,
		domains: domains,
		method: msg.method,
		url: msg.url,
		body: msg.url,
		host: msg.headers.url,
		userAgent: msg.headers["user-agent"],
		referer: msg.headers.referer || msg.headers.origin
	};
}

exports.process = function(msg) {
	if(disabled)
		return;
	if(!connecting)
		init();
	//add to db
	new Echo(msg2doc(msg)).save(function (err) {
		if (err) return console.error('error saving document');
	});
};

