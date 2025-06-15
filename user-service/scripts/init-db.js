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
    console.log('Starting database initialization...');    // Seed admin user with fixed ID
    const salt = await bcrypt.genSalt(10);
    
    // Use fixed admin ID
    const adminId = 'admin-fixed-id-123456789';
    const hashedPassword = await bcrypt.hash('adminpassword', salt);

    const admin = await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        id: adminId,
        username: 'admin',
        email: 'admin@example.com',
        password_hash: hashedPassword
      }
    });

    console.log(`Admin user created with ID: ${admin.id}`);
    
    // Create test users with fixed IDs
    const testUsers = [];
    const fixedUserIds = [
      '5f85d97d-bbac-43c0-a78f-4a503307e57c',
      '54ac59b6-b825-40a1-a012-fd99d0674ace', 
      '4114ed96-2a19-455f-a491-e9ac5f6da2d3',
      '6d793e61-16e6-4e82-80f9-2c51c5ca5f96',
      '6f7af8db-e7c5-476d-ba63-8ef2c69b1013'
    ];
    
    for (let i = 1; i <= 5; i++) {
      const hashedPw = await bcrypt.hash(`password${i}`, salt);
      
      const user = await prisma.user.upsert({
        where: { email: `user${i}@example.com` },
        update: {},
        create: {
          id: fixedUserIds[i-1],
          username: `user${i}`,
          email: `user${i}@example.com`,
          password_hash: hashedPw
        }
      });
      
      testUsers.push(user);
      console.log(`Test user created: ${user.username} with ID: ${user.id}`);
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
