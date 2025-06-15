#!/bin/sh
set -e

# Ensure all dependencies are installed
echo "Ensuring all dependencies are installed..."
npm install

# Start the application
echo "Starting the API Gateway..."
exec "$@"
