var fs = require('fs');
var syslog = require('modern-syslog');

if (process.argv.length <= 2) {
    syslog.alert("Usage: " + __filename + " path/to/image");
    process.exit(-1);
}

var img_path = process.argv[2];
syslog.notice('new image file: ' + img_path);



