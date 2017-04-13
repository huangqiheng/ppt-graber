#!/bin/bash

if [ "$1" = "stop" ]; then
	systemctl stop vsrc msrc motion ffserver nginx
	exit 0
fi

if [ "$1" = "start" ]; then
	systemctl start vsrc motion ffserver msrc nginx
	exit 0
fi

if [ "$1" = "restart" ]; then
	systemctl stop vsrc msrc motion ffserver nginx
	systemctl start vsrc motion ffserver msrc nginx
	exit 0
fi

if [ "$1" = "enable" ]; then
	cp conf/vsrc.service /lib/systemd/system/vsrc.service
	cp conf/msrc.service /lib/systemd/system/msrc.service
	cp conf/motion.service /lib/systemd/system/motion.service
	cp conf/ffserver.service /lib/systemd/system/ffserver.service
	cp conf/nginx.service /lib/systemd/system/nginx.service
	systemctl enable vsrc msrc motion ffserver nginx
	exit 0
fi

if [ "$1" = "disable" ]; then
	systemctl disable vsrc motion ffserver msrc nginx
	exit 0
fi


