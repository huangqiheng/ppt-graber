////////////////////////////////////////////////////////////////////////

const ARGS = {
	device: '/dev/video0',
	width: 640,
	height: 360,
	interval: 1000,
	threshold: 0x15, 
	minChange: 1
}

////////////////////////////////////////////////////////////////////////
const fs =  require("fs");
const v4l2camera = require("v4l2camera");
const Motion = require('motion-detect').Motion;

const motion = new Motion({
	threshold: ARGS.threshold, 
	minChange: ARGS.minChange
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

format.width = 640;
format.height = 360;
//format.interval.numerator = 1;
//format.interval.denominator = 1;

cam.configSet(format);
cam.start();

var cap_index = 0;
cam.capture(function loop() {
	let raw = cam.frameRaw();
	let hasMotion = motion.detect(raw);

	if (hasMotion) {
		console.log('detect motion: hasMotion');
		let jpg_file = `result${cap_index++}.jpg`;
		fs.createWriteStream(jpg_file).end(new Buffer(raw));
	}

	setTimeout(()=> {cam.capture(loop);}, ARGS.interval);
});

