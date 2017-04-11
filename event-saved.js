
const AID_STR = 'NDEzOTE0ODg4NzgyOTg4NTE=';
const AID_IFACE = 'eno1';
const WEB_ROOT = '/root/ppt-graber/html';

//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////

var fs = require('fs');
var syslog = require('modern-syslog');
var http = require('http');
var querystring = require('querystring');
var ifaces = require( 'os' ).networkInterfaces();

if (process.argv.length <= 2) {
    syslog.alert("Usage: " + __filename + " path/to/image");
    process.exit(-1);
}

var img_path = process.argv[2];
var address = ifaces[AID_IFACE][0].address;
var path = img_path.slice(WEB_ROOT.length); 
var imgurl = 'http://' + address + path;

http.get({
	hostname: 'dshow.doctorcom.com',
	path: '/hcx/pptliveurl?url=' + querystring.escape(imgurl) + '&aidStr=' + AID_STR,
	timeout: 1000
}, (res) => {
	if (res.statusCode !== 200) {
		syslog.error('sync error('+res.statusCode+') : ' + res.url);
	}
});
