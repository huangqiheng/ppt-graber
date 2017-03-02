# ppt-graber ## initial install dependent tools ```
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
echo "CONCURRENCY := $(expr `nproc` + 1)" >> /etc/kernel-pkg.conf

make menuconfig
	1)load .config
	2)Device Drivers
	3)Multimedia support (MEDIA_SUPPORT [=*])                                                                                           x
	4)Media PCI Adapters (MEDIA_PCI_SUPPORT [=*]) 
	5)Magewell Procapture audio/video grabber and encoder [=*]

make-kpkg clean
make-kpkg --initrd --revision 1.01 --append-to-version -magewell kernel_image kernel_headers

wget https://01.org/sites/default/files/downloads/intelr-graphics-linux/kblgucver914.tar.bz2
tar xvf kblgucver914.tar.bz2 && cd kblgucver914 && ./install
wget https://01.org/sites/default/files/downloads/intelr-graphics-linux/bxtgucver87.tar.bz2
tar xvf bxtgucver87.tar.bz2 && cd bxtgucver87 && ./install
wget https://01.org/sites/default/files/downloads/intelr-graphics-linux/kbldmcver101.tar.bz2
tar xvf kbldmcver101.tar.bz2 && cd kbldmcver101 && ./install

dpkg -i linux-image-*.deb
dpkg -i linux-headers-*.deb

vim /etc/default/grub
GRUB_DEFAULT='Advanced options for Ubuntu>Ubuntu, with Linux 4.8.0-rc7'
update-grub

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
