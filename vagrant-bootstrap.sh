sudo apt-get update
sudo apt-get install -y python-pip vim postgresql postgresql-contrib python-dev python-psycopg2 libpq-dev git

sudo pip install virtualenv
sudo pip install virtualenvwrapper
sudo pip install cookiecutter
sudo pip install pyyaml

sudo echo 'export WORKON_HOME=/home/vagrant/.virtualenvs' >> /home/vagrant/.bashrc
sudo echo 'export PROJECT_HOME=/vagrant' >> /home/vagrant/.bashrc
sudo echo 'source /usr/local/bin/virtualenvwrapper.sh' >> /home/vagrant/.bashrc

sudo echo 'cd /vagrant' >> /home/vagrant/.profile
