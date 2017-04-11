const conf = require('./config.js');
const fs = require('fs');
const syslog = require('modern-syslog');
const http = require('http');
const querystring = require('querystring');
const ifaces = require( 'os' ).networkInterfaces();
const async = require('async');
const spawn = require('child_process').spawn;
const redis = require('redis');
const client = redis.createClient();

if (process.argv.length <= 2) {
    syslog.alert("Usage: " + __filename + " path/to/image");
    process.exit(-1);
}

let img_path = process.argv[2];
let address = ifaces[conf.AID_IFACE][0].address;
let path = img_path.slice(conf.WEB_ROOT.length); 
let imgurl = 'http://' + address + path;

async.waterfall([(callback)=> {
	client.get('last-saved-image', (err, saved) => {
		if (!saved) {
			callback('report', null);
			return;
		}
		client.get('last-report-image', (err, reported) => {
			reported && callback('report');
			reported || callback(null, [saved.img_file, reported.time]);
		});
	});

}, (res, callback)=> {
	let last_saved_image = res[0];
	let last_report_time = res[1];
	let compare = spawn('compare', ['-metric RMSE', last_saved_image, img_path]);
	compare.stdout.on('end', (data) => {
		let diff = parseInt(data);
		callback(null, [last_report_time, diff]);
	});
	compare.on('exit', (code, signal) => {
		if (code != 0) callback('exit');
	});

}, (res, callback)=> {

}],(err, result)=> {
	if (err === 'report') {

	}

});


/*
client.ltrim('motion-list', 0, 99);
client.lpush('motion-list', img_path);
*/




/*


let img_path = process.argv[2];
let address = ifaces[conf.AID_IFACE][0].address;
let path = img_path.slice(conf.WEB_ROOT.length); 
let imgurl = 'http://' + address + path;

let compare = spawn('compare', ['-metric RMSE', last_img, img_path]);


*/

//compare -metric RMSE first.jpg second.jpg


