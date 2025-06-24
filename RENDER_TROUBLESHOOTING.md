# Render Deployment Setup and Troubleshooting Guide

## Updates to the Render Configuration

The `render.yaml` file has been updated to fix deployment issues. Key changes include:

1. Added `rootDir` parameters to specify the correct directory for each service
2. Changed the startCommand to use the correct path format for Render's environment
3. Added Prisma binary targets for proper compatibility with Render's Linux environment

## Additional Setup for Prisma Services

For services using Prisma (user-service and post-service), you'll need to make the following changes:

### 1. Update the Prisma Schema

For both user-service and post-service, you should update the prisma/schema.prisma file to include proper binary targets:

```prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "rhel-openssl-1.0.x"]
}
```

### 2. Database Initialization

Since we can't use the entrypoint.sh scripts directly on Render, you should manually set up your database schema after the first deployment:

1. Connect to your service via the Render Shell
2. Run the following commands:
   ```
   npx prisma migrate deploy
   npx prisma db seed
   ```

## Environment Variables

Make sure to set up the following environment variables in the Render dashboard:

1. `DATABASE_URL` for both user-service and post-service
2. `REDIS_URL` for feed-service
3. `KAFKA_BROKERS`, `CONFLUENT_API_KEY`, and `CONFLUENT_API_SECRET` if using Confluent Cloud

## Troubleshooting Common Issues

### Module Not Found Errors

If you see "Cannot find module" errors, check:
- The build output in the Render logs to ensure files are generated in the expected location
- The startCommand path matches where the files are generated
- The rootDir setting is correct for each service

### Prisma Errors

If you encounter Prisma-related errors:
- Ensure the binaryTargets are properly set
- Try manually running prisma generate and prisma migrate in the Render Shell
- Check if your DATABASE_URL is correctly formatted and accessible

### Service Communication Issues

If services can't communicate with each other:
- Verify that the service URLs in environment variables are correct
- Check the network logs to ensure requests are being made correctly
- Temporarily enable CORS for all origins during testing
