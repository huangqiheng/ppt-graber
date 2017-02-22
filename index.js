var v4l2camera = require("v4l2camera");

var device = '0';
var width = 352;
var height = 288;

try {
    var cam = new v4l2camera.Camera("/dev/video" + device)
} catch (err) {
    console.log("v4l2camera error");
    process.exit(1);
}

console.log("Opened camera device /dev/video" + device);
console.log("format name: " + cam.configGet().formatName);

cam.configSet({
    width: width,
    height: height
});

cam.start();

cam.capture(function loop() {

	var raw = cam.frameRaw();
	require("fs").createWriteStream("result.jpg").end(Buffer(raw));
	cam.capture(loop);
	return;

    var rgb = cam.toRGB();
    console.log("W:"+cam.width+"H:"+cam.height)

    cam.capture(loop);
});
