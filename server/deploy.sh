#!/bin/bash

echo What should the version be?
read VERSION
echo "Fine, deploying" $VERSION

docker build -t dockerwokker/lireddit:$VERSION .
docker push dockerwokker/lireddit:$VERSION

# og: ssh root@142.93.143.120
ssh -i ~/.ssh/digitalocean root@142.93.143.120 "docker pull dockerwokker/lireddit:$VERSION && docker tag dockerwokker/lireddit:$VERSION dokku/api:$VERSION && dokku deploy api $VERSION"


