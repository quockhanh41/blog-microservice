const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Post Service database...');
  
  try {
    // Seed user references (example data)
    const userRefs = [
      { user_id: '123e4567-e89b-12d3-a456-426614174000', username: 'john_doe' },
      { user_id: '123e4567-e89b-12d3-a456-426614174001', username: 'jane_smith' },
      { user_id: '123e4567-e89b-12d3-a456-426614174002', username: 'bob_wilson' },
    ];

    for (const userRef of userRefs) {
      await prisma.userReference.upsert({
        where: { user_id: userRef.user_id },
        update: {},
        create: userRef,
      });
    }

    // Seed posts (example data)
    const posts = [
      {
        author_id: '123e4567-e89b-12d3-a456-426614174000',
        username: 'john_doe',
        title: 'Welcome to our Blog!',
        content: 'This is the first post on our new microservices-based blog platform. Exciting times ahead!'
      },
      {
        author_id: '123e4567-e89b-12d3-a456-426614174001',
        username: 'jane_smith',
        title: 'Understanding Microservices',
        content: 'Microservices architecture allows us to build scalable and maintainable applications. Here are the key benefits...'
      },
      {
        author_id: '123e4567-e89b-12d3-a456-426614174002',
        username: 'bob_wilson',
        title: 'Getting Started with Docker',
        content: 'Docker makes it easy to containerize our microservices. Let me walk you through the basics...'
      }
    ];

    for (const post of posts) {
      await prisma.post.create({
        data: post
      });
    }

    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Database seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
