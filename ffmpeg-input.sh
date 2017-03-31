#!/bin/bash

is_run=$(ps -ef | grep ffmpeg-input.sh | grep -v grep | wc -l)

if [ "$is_run" = "1" ]; then
	echo 'is running'
else
	/usr/bin/ffmpeg  -v quiet -f v4l2 -r 30 -s 1920x1080 -i /dev/video0  -f v4l2 -r 30 -s 1280x720 /dev/video1 -f v4l2 -r 30 /dev/video2
fi

exit 0
