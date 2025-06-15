const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Initializing Post Service database...');
  
  try {
    // Test connection
    await prisma.$connect();
    console.log('Database connection successful');
    
    // You can add seed data here if needed
    console.log('Database initialization completed');
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
