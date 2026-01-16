#!/bin/bash

# Deploy script for PDV Test Project

echo "Starting deployment..."

# Check if docker is installed
if ! command -v docker &> /dev/null
then
    echo "Docker could not be found. Please install Docker first."
    exit 1
fi

echo "Building and starting containers..."
docker compose down
docker compose up -d --build

echo "Deployment complete!"

# Attempt to get public IP, fallback to localhost
SERVER_IP=$(hostname -I | awk '{print $1}')
if [ -z "$SERVER_IP" ]; then
    SERVER_IP="localhost"
fi

echo "Frontend: http://$SERVER_IP"
echo "Backend API: http://$SERVER_IP/api"
echo "Swagger Docs: http://$SERVER_IP/docs"
