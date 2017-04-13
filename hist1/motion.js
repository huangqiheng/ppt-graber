////////////////////////////////////////////////////////////////////////

const ARGS = {
	device: '/dev/video0',
	width: 1280,//640,
	height: 720,//360,
	interval: 1000,
	threshold: 0x18, 
	minChange: 10,
	cache_dir: __dirname + '/cache'
}

////////////////////////////////////////////////////////////////////////
const fs =  require("fs");
const mkdirp = require('mkdirp');
const v4l2camera = require("v4l2camera");
const Motion = require('motion-detect').Motion;
const echo = require('node-echo');
const path = require('path');

const motion = new Motion({
	threshold: ARGS.threshold, 
	minChange: ARGS.minChange,
});

try {
    var cam = new v4l2camera.Camera(ARGS.device)
} catch (err) {
    console.log("v4l2camera error");
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
  console.log("NOTICE: MJPG camera required");
  process.exit(1);
}

format.width = ARGS.width;
format.height = ARGS.height;
//format.interval.numerator = 1;
//format.interval.denominator = 1;

cam.configSet(format);
cam.start();

var output_html = '<html><head><style media="screen" type="text/css">img{width:320;height:180;}</style></head><body>';
var output_end = '</body></html>';
var img_appends = '';

mkdirp.sync(ARGS.cache_dir);
var cap_index = 0;
cam.capture(function loop() {
	let rgb = cam.toRGB();
	let hasMotion = motion.detect(rgb);

	if (hasMotion) {
		console.log('detect motion: hasMotion');
		let jpg_file = ARGS.cache_dir + `/result${cap_index++}.jpg`;
		fs.createWriteStream(jpg_file).end(new Buffer(cam.frameRaw()));

		let timetick = Math.floor(Date.now() / 1000);
		img_appends += '<img src="cache/'+path.basename(jpg_file)+"?id="+timetick+'" />';
		echo.sync(output_html + img_appends + output_end, '>', 'index.html');
	}

	setTimeout(()=> {cam.capture(loop);}, ARGS.interval);
});

