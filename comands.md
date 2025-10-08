git checkout deploy.sh
chmod +x deploy.sh

git pull origin master
./deploy.sh staging
