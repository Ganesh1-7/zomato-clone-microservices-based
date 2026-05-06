#!/bin/bash
docker build -t ganesh1702/restaurant-service:latest -f backend/services/restaurant-service/Dockerfile .
docker build -t ganesh1702/order-service:latest -f backend/services/order-service/Dockerfile .
docker build -t ganesh1702/payment-service:latest -f backend/services/payment-service/Dockerfile .
docker build -t ganesh1702/delivery-service:latest -f backend/services/delivery-service/Dockerfile .

docker push ganesh1702/restaurant-service:latest
docker push ganesh1702/order-service:latest
docker push ganesh1702/payment-service:latest
docker push ganesh1702/delivery-service:latest