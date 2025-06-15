#!/usr/bin/env node

/**
 * Database initialization script for User Service
 * This will create initial database schema and seed admin user
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Starting database initialization...');

    // Seed admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('adminpassword', salt);

    const admin = await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        username: 'admin',
        email: 'admin@example.com',
        password_hash: hashedPassword
      }
    });

    console.log(`Admin user created with ID: ${admin.id}`);
    
    // Create test users
    const testUsers = [];
    
    for (let i = 1; i <= 5; i++) {
      const hashedPw = await bcrypt.hash(`password${i}`, salt);
      
      const user = await prisma.user.upsert({
        where: { email: `user${i}@example.com` },
        update: {},
        create: {
          username: `user${i}`,
          email: `user${i}@example.com`,
          password_hash: hashedPw
        }
      });
      
      testUsers.push(user);
      console.log(`Test user created: ${user.username}`);
    }
    
    // Create some follow relationships
    for (let i = 0; i < testUsers.length; i++) {
      for (let j = 0; j < testUsers.length; j++) {
        if (i !== j) {
          try {
            await prisma.follow.create({
              data: {
                follower_id: testUsers[i].id,
                followed_id: testUsers[j].id
              }
            });
            console.log(`${testUsers[i].username} now follows ${testUsers[j].username}`);
          } catch (error) {
            // Ignore duplicate follow relationships
            if (error.code !== 'P2002') {
              throw error;
            }
          }
        }
      }
    }

    console.log('Database initialization completed successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
