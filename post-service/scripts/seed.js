const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Post Service database...');
    try {
    // Seed user references with fixed IDs (must match user-service IDs)
    const userRefs = [
      { user_id: '5f85d97d-bbac-43c0-a78f-4a503307e57c', username: 'user1' },
      { user_id: '54ac59b6-b825-40a1-a012-fd99d0674ace', username: 'user2' },
      { user_id: '4114ed96-2a19-455f-a491-e9ac5f6da2d3', username: 'user3' },
      { user_id: '6d793e61-16e6-4e82-80f9-2c51c5ca5f96', username: 'user4' },
      { user_id: '6f7af8db-e7c5-476d-ba63-8ef2c69b1013', username: 'user5' }
    ];

    console.log('Creating user references...');
    for (const userRef of userRefs) {
      await prisma.userReference.upsert({
        where: { user_id: userRef.user_id },
        update: { username: userRef.username },
        create: userRef,
      });
      console.log(`User reference created/updated: ${userRef.username} (${userRef.user_id})`);
    }

    // Seed posts (example data)
    const posts = [
      {
        author_id: '5f85d97d-bbac-43c0-a78f-4a503307e57c',
        username: 'user1',
        title: 'Welcome to our Blog!',
        content: 'This is the first post on our new microservices-based blog platform. Exciting times ahead!'
      },
      {
        author_id: '54ac59b6-b825-40a1-a012-fd99d0674ace',
        username: 'user2',
        title: 'Understanding Microservices',
        content: 'Microservices architecture allows us to build scalable and maintainable applications. Here are the key benefits...'
      },
      {
        author_id: '4114ed96-2a19-455f-a491-e9ac5f6da2d3',
        username: 'user3',
        title: 'Getting Started with Docker',
        content: 'Docker makes it easy to containerize our microservices. Let me walk you through the basics...'
      }
      ,
      {
        author_id: '6d793e61-16e6-4e82-80f9-2c51c5ca5f96',
        username: 'user4',
        title: 'Kubernetes for Orchestration',
        content: 'Kubernetes is a powerful tool for managing containerized applications. Here’s how we use it...'
      },
      {
        author_id: '6f7af8db-e7c5-476d-ba63-8ef2c69b1013',
        username: 'user5',
        title: 'Service Mesh with Istio',
        content: 'Istio provides a way to manage microservices traffic. Let’s explore its features...'
      }    ];

    console.log('Creating posts...');
    for (const post of posts) {
      const createdPost = await prisma.post.create({
        data: post
      });
      console.log(`Post created: "${post.title}" by ${post.username} (ID: ${createdPost.id})`);
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
