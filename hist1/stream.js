
////////////////////////////////////////////////////////////////////////

const ARGS = {
	device: '/dev/video0',
	width: 1280,//640,
	height: 720,//360,
	cache_dir: __dirname + '/cache'
}

////////////////////////////////////////////////////////////////////////
const fs =  require("fs");
const mkdirp = require('mkdirp');
const v4l2camera = require("v4l2camera");
const echo = require('node-echo');
const path = require('path');
const http = require('http');
const mjpegServer = require('mjpeg-server');

//////////////////////////////////////////////////////////////////////
echo('camera initialization');
//////////////////////////////////////////////////////////////////////

try {
    var cam = new v4l2camera.Camera(ARGS.device)
} catch (err) {
    echo("v4l2camera error");
    process.exit(1);
}

var format = null;
for(let item of cam.formats) {
	if (item.formatName === 'MJPG') {
		format = item;
		break;
	}
}

if (format === null) {
  echo("NOTICE: MJPG camera required");
  process.exit(1);
}

format.width = ARGS.width;
format.height = ARGS.height;
//format.interval.numerator = 1;
//format.interval.denominator = 1;

cam.configSet(format);
cam.start();

//////////////////////////////////////////////////////////////////////
echo('camera running');
//////////////////////////////////////////////////////////////////////

var req_arr = new Array();

var server = http.createServer(function(req, res) {
	echo('incoming new connection!');
	let mjpegReqHandler = mjpegServer.createReqHandler(req, res);
	req_arr.push(mjpegReqHandler);

	//console.log(res.socket);

	res.socket.on('close', (e)=>{
		echo('connection closed');
		mjpegReqHandler.inactive = true;
	});

	//console.log(mjpegReqHandler.res.connection);
}).listen(8081);

cam.capture(function loop() {
	for(req of req_arr) {
		if (req.inactive) {
			//console.log(req);
		} else {
			req.write(new Buffer(cam.frameRaw()));
		}
	}
	cam.capture(loop);
});

