# ppt-graber

## initial install dependent tools

```
apt update -y && apt upgrade -y
apt install -y build-essential python

curl -sL https://deb.nodesource.com/setup_7.x | sudo -E bash -
apt install nodejs

apt install -y imagemagick
apt install -y v4l-utils v4l-conf libv4l-dev


```

## compile kernel

```
apt install -y ncurses-dev libssl-dev xz-utils kernel-package

wget https://codeload.github.com/jeremymcrhat/magewell-pro-capture/zip/pro_capture
unzip magewell-pro-capture-pro_capture.zip 
cd magewell-pro-capture-pro_capture

make mrproper
cp /boot/config-$(uname -r) .config
make menuconfig
	1)load .config
	2)General Setup --> Prompt for development and/or incomplete code/drivers
	3)remove *

make-kpkg clean
make-kpkg --initrd kernel_image kernel_headers

dpkg -i linux-image-*.deb
dpkg -i linux-headers-*.deb

reboot
uname -r
apt-get purge linux-image-xx-xx-generic linux-image-extra-xx-xx-generic
```


## install magewell ProCapture driver

```
apt install -y linux-headers-$(uname -r)
apt install -y libasound2

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