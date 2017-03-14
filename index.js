const v4l2camera = require("v4l2camera");
const fs =  require("fs");

var device = '/dev/video0';
var width = 320;
var height = 240;

try {
    var cam = new v4l2camera.Camera(device)
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

format.width = width;
format.height = height;

cam.configSet(format);
cam.start();

console.log("Width:"+cam.width+"Height:"+cam.height)

var cap_index = 0;
cam.capture(function loop() {
	let raw = cam.frameRaw();
	let jpg_file = `result${cap_index++}.jpg`;
	fs.createWriteStream(jpg_file).end(Buffer(raw));
	cam.capture(loop);
});

