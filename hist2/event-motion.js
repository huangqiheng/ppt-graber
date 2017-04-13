const conf = require('./config.js');
const fs = require('fs');
const syslog = require('modern-syslog');
const http = require('http');
const querystring = require('querystring');
const ifaces = require('os').networkInterfaces();
const async = require('async');
const exec = require('child_process').exec;
const redis = require('redis');
const client = redis.createClient();
const path = require('path');

if (process.argv.length <= 2) {
    syslog.alert("Usage: " + __filename + " path/to/image");
    process.exit(-1);
}

let img_path = process.argv[2];
let time = Date.now();

async.waterfall([(callback)=> {
// get and set motion pics path from redis
	client.getset('last-saved-image', JSON.stringify({
		'img_file': img_path, 
		'time': time
	}), (err,saved)=>{
		saved && callback(null, saved);
		saved || callback('report', null);
	});

//read last static image
}, (saved, callback) => {
	client.get('last-static-image', (err, staticd) => {
		staticd && callback(null, [saved, staticd]);
		staticd || callback('report', null);
	});

//compare the nearest images
}, ([saved, staticd], callback)=> {
	let last_saved_image = JSON.parse(saved).img_file;
	let staticed = JSON.parse(staticd);

	let cmd = ['compare','-metric RMSE',last_saved_image,img_path,'null:'].join(' ');
	let compare = exec(cmd, (error, stdout, stderr) => {
		syslog.alert('compare: ', stderr, ' -> ', path.basename(last_saved_image), path.basename(img_path)); 
		if (stderr) {
			let regexp = /^(\d+(\.\d+)?).+\((\d+(\.\d+)?)\)$/i;
			let found = stderr.match(regexp);
			if (found) {
				let [x, num_a, xx, num_b] = found;
				callback(null, [parseFloat(num_a), parseFloat(num_b), staticed]);
			} else {
				syslog.alert('compare invalid');
				callback('ignore');
			}
		} else {
			callback('ignore');
		}
	});

//check the stage, deside report or ignore
}, ([num_a, num_b, staticed], callback)=> {

	let last_static_time = staticed.time;
	let is_diff_image = num_a > 3000;
	let is_waitting_report =  time - last_static_time < 2000;
	let has_been_reported = staticed.reported;
	let static_image = staticed.img_path? staticed.img_path : img_path;
	let time_pass = time - staticed.time;

	// if defference
	if (is_diff_image) {
		client.set('last-static-image', JSON.stringify({
			'reported': false,
			'img_file': img_path, 
			'time': time
		}), (err,res)=>{
			callback('ignore');
		});
		return;
	};

	//if they're same image 
	if (is_waitting_report) {
		return callback('ignore');
	};

	//now it's time to report
	if (!has_been_reported) {
		client.set('last-static-image', JSON.stringify({
			'reported': true,
			'img_file': static_image, 
			'time': staticed.time
		}), (err,res)=>{
			//syslog.alert('pre report: ', static_image);
			callback(null, [static_image, time_pass]);
		});
		return;
	};

	//has been reported, so ignore
	callback('ignore');

//copy file
}, ([static_image, time_pass], callback) => {
	let report_file = conf.SHOWS_ROOT + '/' + path.basename(static_image);
	let cmd = ['cp', static_image, report_file].join(' ');
	let cp_shows = exec(cmd, (error, stdout, stderr) => {
		callback(null, [static_image, report_file, time_pass]);
	});

//delete old files
}, ([static_image, report_file, time_pass], callback) => {
	exec('du ' + conf.PICS_ROOT, (err,stdout,stderr)=> {
		let [size, args] = stdout.match(/^(\d+)/i);

		if (size < 25000) {
			return callback('report', [report_file, time_pass]);
		}

		exec('rm ' + conf.PICS_ROOT + '/*', ()=>{
			callback('report', [report_file, time_pass]);
		});
	});

// take the action
}],(error, result)=> {
	if (error === 'report') {
		if (result) {
			var [report_file, time_pass] = result;
		} else {
			var report_file = conf.SHOWS_ROOT + '/' + path.basename(img_path);
			var time_pass = 0;
		}

		syslog.alert('------------------> report: ', report_file, time_pass, ' <--------------------');

		let address = ifaces[conf.AID_IFACE][0].address;
		let imgurl = 'http://' + address + report_file.slice(conf.WEB_ROOT.length);

		syslog.alert('report as: ', imgurl);

		http.get({
			hostname: conf.REPORT_HOST,
			path: '/hcx/pptliveurl?url=' + querystring.escape(imgurl) + '&aidStr=' + conf.AID_STR,
			timeout: 1000
		}, (res) => {
			if (res.statusCode !== 200) {
				return syslog.error('sync error('+res.statusCode+') : ' + res.url);
			}
			syslog.alert('done report');
		});
	} else {
		//syslog.alert('ignore: ', error, result);
		setTimeout(()=>{process.exit(-1)},200);
	}
});
