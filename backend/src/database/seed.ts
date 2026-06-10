import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../app.module';
import { User } from './schemas/user.schema';
import { Post } from './schemas/post.schema';
import { Comment } from './schemas/comment.schema';

async function bootstrap() {
  console.log('🌱 Starting database seeding...');
  const app = await NestFactory.createApplicationContext(AppModule);

  const userModel = app.get<Model<User>>(getModelToken(User.name));
  const postModel = app.get<Model<Post>>(getModelToken(Post.name));
  const commentModel = app.get<Model<Comment>>(getModelToken(Comment.name));

  console.log('🧹 Clearing existing collections...');
  await userModel.deleteMany({});
  await postModel.deleteMany({});
  await commentModel.deleteMany({});
  console.log('✅ Collections cleared.');

  console.log('🔑 Hashing password...');
  const passwordHash = await bcrypt.hash('Password123!', 12);

  console.log('👤 Creating users...');
  const usersData = [
    { firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', passwordHash },
    { firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com', passwordHash },
    { firstName: 'Alice', lastName: 'Johnson', email: 'alice.johnson@example.com', passwordHash },
    { firstName: 'Bob', lastName: 'Brown', email: 'bob.brown@example.com', passwordHash },
  ];

  const createdUsers = await userModel.create(usersData);
  const [john, jane, alice, bob] = createdUsers;
  console.log(`✅ Created ${createdUsers.length} users.`);

  console.log('📝 Creating posts...');
  const postsData = [
    {
      content: 'Welcome to the new social feed! This is a public post with some text.',
      imageUrl: null,
      visibility: 'public',
      author: john._id,
      likedBy: [jane._id, alice._id],
      commentsCount: 0,
    },
    {
      content: 'Just keeping a private journal post here. Nobody else should see this!',
      imageUrl: null,
      visibility: 'private',
      author: john._id,
      likedBy: [],
      commentsCount: 0,
    },
    {
      content: 'I love backend development with NestJS and MongoDB!',
      imageUrl: null,
      visibility: 'public',
      author: jane._id,
      likedBy: [john._id, alice._id, bob._id],
      commentsCount: 0,
    },
    {
      content: 'A beautiful day to build a modern React feed app.',
      imageUrl: null,
      visibility: 'public',
      author: alice._id,
      likedBy: [jane._id],
      commentsCount: 0,
    },
    {
      content: 'Late-night debugging session turned into a breakthrough.',
      imageUrl: null,
      visibility: 'public',
      author: bob._id,
      likedBy: [john._id],
      commentsCount: 0,
    },
    {
      content: 'Sketching upcoming UI ideas with bold gradients.',
      imageUrl:
        'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=800&q=80',
      visibility: 'public',
      author: alice._id,
      likedBy: [john._id, jane._id],
      commentsCount: 0,
    },
    {
      content: 'Turning off notifications for a weekend of deep work.',
      imageUrl: null,
      visibility: 'private',
      author: jane._id,
      likedBy: [],
      commentsCount: 0,
    },
    {
      content: 'Shipping small updates on the monorepo keeps momentum high.',
      imageUrl: null,
      visibility: 'public',
      author: john._id,
      likedBy: [alice._id],
      commentsCount: 0,
    },
    {
      content: 'Testing out MongoDB aggregation pipelines for analytics.',
      imageUrl: null,
      visibility: 'public',
      author: bob._id,
      likedBy: [john._id, jane._id],
      commentsCount: 0,
    },
    {
      content: 'Front-end theming experiments with dark mode typography.',
      imageUrl:
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
      visibility: 'public',
      author: jane._id,
      likedBy: [alice._id],
      commentsCount: 0,
    },
    {
      content: 'Documenting API contracts before refactoring controllers.',
      imageUrl: null,
      visibility: 'public',
      author: john._id,
      likedBy: [jane._id],
      commentsCount: 0,
    },
    {
      content: 'Coffee break thoughts: tests that are hard to maintain hint at better design.',
      imageUrl: null,
      visibility: 'public',
      author: alice._id,
      likedBy: [bob._id],
      commentsCount: 0,
    },
    {
      content: 'Scheduling pair-programming sessions for next sprint.',
      imageUrl: null,
      visibility: 'public',
      author: jane._id,
      likedBy: [john._id, alice._id],
      commentsCount: 0,
    },
    {
      content: 'Trying out a minimalist dashboard layout for analytics.',
      imageUrl:
        'https://images.unsplash.com/photo-1487017159836-4e23ece2e4cf?auto=format&fit=crop&w=800&q=80',
      visibility: 'public',
      author: bob._id,
      likedBy: [alice._id],
      commentsCount: 0,
    },
    {
      content: 'Refining responsive spacing tokens for mobile feed.',
      imageUrl: null,
      visibility: 'public',
      author: alice._id,
      likedBy: [john._id],
      commentsCount: 0,
    },
    {
      content: 'Security review notes: rotate credentials quarterly.',
      imageUrl: null,
      visibility: 'private',
      author: john._id,
      likedBy: [],
      commentsCount: 0,
    },
    {
      content: 'Launched a new unit test suite for the comments service.',
      imageUrl: null,
      visibility: 'public',
      author: jane._id,
      likedBy: [bob._id],
      commentsCount: 0,
    },
    {
      content: 'Experimenting with optimistic updates on likes.',
      imageUrl: null,
      visibility: 'public',
      author: bob._id,
      likedBy: [john._id, alice._id],
      commentsCount: 0,
    },
    {
      content: 'Weekend hike photos incoming once I finish exporting RAW files.',
      imageUrl:
        'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80',
      visibility: 'public',
      author: alice._id,
      likedBy: [jane._id, bob._id],
      commentsCount: 0,
    },
    {
      content: 'Diving into NestJS interceptors to clean responses.',
      imageUrl: null,
      visibility: 'public',
      author: john._id,
      likedBy: [bob._id],
      commentsCount: 0,
    },
    {
      content: 'Learning how to storyboard onboarding animations.',
      imageUrl: null,
      visibility: 'public',
      author: jane._id,
      likedBy: [alice._id],
      commentsCount: 0,
    },
    {
      content: 'Redis caching spikes reduced API latency by 40%.',
      imageUrl: null,
      visibility: 'public',
      author: bob._id,
      likedBy: [john._id, jane._id],
      commentsCount: 0,
    },
    {
      content: 'Cooked a new pasta recipe; might share the sauce secrets soon.',
      imageUrl:
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
      visibility: 'public',
      author: alice._id,
      likedBy: [john._id],
      commentsCount: 0,
    },
    {
      content: 'Reading “Designing Data-Intensive Applications” this month.',
      imageUrl: null,
      visibility: 'public',
      author: john._id,
      likedBy: [jane._id],
      commentsCount: 0,
    },
    {
      content: 'Meditation streak reached 21 days!',
      imageUrl: null,
      visibility: 'public',
      author: jane._id,
      likedBy: [john._id],
      commentsCount: 0,
    },
    {
      content: 'Refactoring auth guard tests to be more deterministic.',
      imageUrl: null,
      visibility: 'public',
      author: bob._id,
      likedBy: [alice._id],
      commentsCount: 0,
    },
    {
      content: 'Trying to beat personal record on the rowing machine.',
      imageUrl: null,
      visibility: 'public',
      author: john._id,
      likedBy: [bob._id],
      commentsCount: 0,
    },
    {
      content: 'Drafted guidelines for better pull request reviews.',
      imageUrl: null,
      visibility: 'public',
      author: jane._id,
      likedBy: [alice._id, bob._id],
      commentsCount: 0,
    },
    {
      content: 'Prototype of a pastel color scheme ready for critique.',
      imageUrl: null,
      visibility: 'public',
      author: alice._id,
      likedBy: [jane._id],
      commentsCount: 0,
    },
    {
      content: 'Automated backup scripts just finished running successfully.',
      imageUrl: null,
      visibility: 'private',
      author: bob._id,
      likedBy: [],
      commentsCount: 0,
    },
    {
      content: 'Booked tickets to the next JS conference!',
      imageUrl: null,
      visibility: 'public',
      author: john._id,
      likedBy: [alice._id, bob._id],
      commentsCount: 0,
    },
    {
      content: 'Late-night lo-fi playlist is keeping me in flow.',
      imageUrl: null,
      visibility: 'public',
      author: jane._id,
      likedBy: [john._id],
      commentsCount: 0,
    },
    {
      content: 'Testing WebGL shaders for a playful splash screen.',
      imageUrl:
        'https://images.unsplash.com/photo-1448932223592-d1fc686e76ea?auto=format&fit=crop&w=800&q=80',
      visibility: 'public',
      author: alice._id,
      likedBy: [bob._id],
      commentsCount: 0,
    },
    {
      content: 'Dockerized the entire monorepo for smoother onboarding.',
      imageUrl: null,
      visibility: 'public',
      author: bob._id,
      likedBy: [john._id, jane._id, alice._id],
      commentsCount: 0,
    },
    {
      content: 'Learning more about accessibility-first navigation.',
      imageUrl: null,
      visibility: 'public',
      author: jane._id,
      likedBy: [alice._id],
      commentsCount: 0,
    },
    {
      content: 'Meal-prepped some spicy tofu bowls for the week.',
      imageUrl:
        'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=800&q=80',
      visibility: 'public',
      author: john._id,
      likedBy: [jane._id],
      commentsCount: 0,
    },
    {
      content: 'Retrospective takeaway: celebrate the small wins.',
      imageUrl: null,
      visibility: 'public',
      author: alice._id,
      likedBy: [john._id, bob._id],
      commentsCount: 0,
    },
    {
      content: 'Building a reading list of underrated engineering blogs.',
      imageUrl: null,
      visibility: 'public',
      author: bob._id,
      likedBy: [alice._id],
      commentsCount: 0,
    },
  ];

  const createdPosts = await postModel.create(postsData);
  console.log(`✅ Created ${createdPosts.length} posts.`);

  console.log('🎉 Database seeding completed successfully!');
  await app.close();
}

bootstrap()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
