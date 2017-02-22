# ppt-graber

## initial install dependent tools

```
apt update -y && apt upgrade -y
apt install -y build-essential python

curl -sL https://deb.nodesource.com/setup_7.x | sudo -E bash -
apt install nodejs

apt install -y imagemagick
apt install -y v4l-utils v4l-conf libv4l-dev
apt install -y libasound2


```

## install magewell ProCapture driver

```
wget http://www.magewell.com/files/ProCaptureForLinux_3269.tar.gz
tar -xzvf ./ProCaptureForLinux_3269.tar.gz
cd ProCaptureForLinux_3269
./install.sh

mwcap-info -l
```

## intall ppt-grader

```
git clone https://github.com/huangqiheng/ppt-graber.git
cd ppt-graber
npm install

```
