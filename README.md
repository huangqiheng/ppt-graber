# ppt-graber

## initial install

```
apt update -y && apt upgrade -y
apt install -y build-essential python
apt install -y imagemagick v4l-utils v4l-conf

curl -sL https://deb.nodesource.com/setup_7.x | sudo -E bash -
apt install nodejs

git clone https://github.com/huangqiheng/ppt-graber.git
cd ppt-graber
npm install
```

## install magewell ProCapture driver

```
wget http://www.magewell.com/files/ProCaptureForLinux_3269.tar.gz
cd ProCaptureForLinux_3269
./install

mwcap-info -l
```

