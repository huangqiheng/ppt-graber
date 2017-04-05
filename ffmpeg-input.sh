#!/bin/bash

is_run=$(ps -ef | grep ffmpeg-input.sh | grep -v grep | wc -l)

if [ "$is_run" = "1" ]; then
	echo 'is running'
else
/usr/bin/ffmpeg  -v quiet -f v4l2 -s 1280x720 -i /dev/video0 -codec copy -f v4l2 /dev/video1 -codec copy -f v4l2 /dev/video2
fi

exit 0
