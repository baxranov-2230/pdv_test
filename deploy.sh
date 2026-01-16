#!/bin/bash

# Deploy script for PDV Test Project

echo "Starting deployment..."

# Check if docker is installed
if ! command -v docker &> /dev/null
then
    echo "Docker could not be found. Please install Docker first."
    exit 1
fi

# Build and run containers
echo "Building and starting containers..."
docker compose down
docker compose up -d --build

echo "Deployment complete!"
echo "Frontend: http://localhost"
echo "Backend API: http://localhost/api"
echo "Swagger Docs: http://localhost/docs"
