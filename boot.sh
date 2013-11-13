#!/bin/sh

# to install postgres database
sudo apt-get install postgresql -y
sudo apt-get update
sudo apt-get install pgadmin3 -y
sudo apt-get install libpq-dev -y
sudo -u postgres psql postgres
sudo -u postgres createdb test

# to install for elasticsearch
sudo apt-get install openjdk-7-jre-headless -y
wget https://download.elasticsearch.org/elasticsearch/elasticsearch/elasticsearch-0.90.5.deb
sudo dpkg -i elasticsearch-0.90.5.deb
sudo service elasticsearch start

# to install for virtual-enviroment
sudo apt-get install python-dev -y
python virtualenv.py virtual
virtual/bin/python setup.py develop
virtual/bin/python manage.py syncdb


# to install node.js + packages for chatting server
sudo apt-get install python-software-properties -y
sudo add-apt-repository ppa:chris-lea/node.js -y
sudo apt-get update
sudo apt-get install nodejs -y
sudo apt-get install npm
npm install cookie
npm install winston
npm install express
npm install socket.io

