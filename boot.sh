#!/bin/sh

# to install postgres database
sudo apt-get install postgresql
sudo apt-get install pgadmin3
sudo apt-get install libpq-dev
sudo -u postgres psql postgres
sudo -u postgres createdb test

# to install for virtual-enviroment
sudo apt-get install python-dev
python virtualenv.py virtual
virtual/bin/python setup.py develop
virtual/bin/python manage.py syncdb


# to install node.js + packages for chatting server
sudo apt-get install python-software-properties
sudo add-apt-repository ppa:chris-lea/node.js
sudo apt-get update
sudo apt-get install nodejs
sudo apt-get install npm
npm install cookie
npm install winston
npm install express
npm install socket.io

