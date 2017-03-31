#!/bin/bash

is_run=$(ps -ef | grep ffmpeg-mjpeg.sh | grep -v grep | wc -l)

if [ "$is_run" = "1" ]; then
	echo 'is running'
else
	/usr/bin/ffmpeg -v quiet -f v4l2 -r 24 -i /dev/video2 http://localhost:8081/webcam.ffm
fi

exit 0
