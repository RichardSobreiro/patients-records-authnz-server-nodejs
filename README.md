<!-- @format -->

# Customers Records Authnz Server

# [Create the docker images](https://www.cloudnweb.dev/2019/9/building-a-production-ready-node-js-app-with-typescript-and-docker)

## Pré-requisites

- After mapping the repo run npm install

```
npm install
```

- Install Typescript globally in your machine

```
npm install -g typescript
```

## 1 - Test the images locally

- Development environment (Typescript server)

```
docker-compose up --build --remove-orphans
```

- Production environment (Nodejs server)

```
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build --remove-orphans
```

## 2 - Create the images

```
docker build -t acreastus2meddistauthnz.azurecr.io/customers-records/authnz:1.0.0 -f DockerfileAuthNZSrv.prd .
docker build -t acreastus2meddistauthnz.azurecr.io/customers-records/api:1.0.0 -f DockerfileAPI.prd .
```

## 3 - Login to Container Registry

```
az login
az acr login --name acreastus2meddistauthnz
```

## 4 - Push the images to Container Registry

```
docker push acreastus2meddistauthnz.azurecr.io/customers-records/authnz:1.0.0
docker push acreastus2meddistauthnz.azurecr.io/customers-records/api:1.0.0
```

##

```
docker pull nginx
docker build -t acreastus2meddistauthnz.azurecr.io/customers-records/ngnix:1.0.0 -f DockerfileNgnix .
docker push acreastus2meddistauthnz.azurecr.io/customers-records/ngnix:1.0.0
```

##

```
docker compose -f docker-compose.yml -f docker-compose.prod-azure.yml up -d --build --remove-orphans
```
