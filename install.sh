#!/bin/bash

apt install -y motion nginx
apt install -y redis-server imagemagick bc

ln -sf /root/ppt-graber/nginx.conf /etc/nginx/nginx.conf
systemctl restart nginx

exit 0



