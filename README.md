# ppt-graber

## initial install

apt update && apt upgrade
apt install -y build-essential python
apt install -y hugin-tools enblend libav-tools
apt install -y node-gyp

curl -sL https://deb.nodesource.com/setup_7.x | sudo -E bash -
apt install nodejs

git clone https://github.com/huangqiheng/kodak-sp360-4k.git
cd kodak-sp360-4k
npm install
