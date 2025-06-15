#!/bin/sh

# This script is for documenting the custom plugin usage in this project
echo "Using custom local Express Gateway plugins..."
echo "- CORS plugin (./plugins/cors.js)"
echo "- Rate Limiting plugin (./plugins/rate-limit.js)"
echo "- Logging plugin (./plugins/log.js)"
echo "- Gateway Info plugin (./plugins/gateway-info.js)"

echo "All plugins are locally defined in the 'plugins' directory."
echo "No external plugin installation is required."

# Restart the gateway (in production environments)
echo "You may need to restart the Express Gateway for changes to take effect."
