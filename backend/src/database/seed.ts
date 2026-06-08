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
      commentsCount: 2,
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
      commentsCount: 1,
    },
    {
      content: 'A beautiful day to build a modern React feed app.',
      imageUrl: null,
      visibility: 'public',
      author: alice._id,
      likedBy: [jane._id],
      commentsCount: 1,
    },
  ];

  const createdPosts = await postModel.create(postsData);
  const [post1, , post3, post4] = createdPosts;
  console.log(`✅ Created ${createdPosts.length} posts.`);

  console.log('💬 Creating comments...');
  const comment1 = await commentModel.create({
    content: 'Awesome! Glad to join.',
    author: jane._id,
    post: post1._id,
    parentComment: null,
    likedBy: [john._id],
  });

  await commentModel.create({
    content: 'Thanks Jane! Great to have you.',
    author: john._id,
    post: post1._id,
    parentComment: comment1._id,
    likedBy: [jane._id],
  });

  await commentModel.create({
    content: 'Same here! NestJS dependency injection is incredible.',
    author: bob._id,
    post: post3._id,
    parentComment: null,
    likedBy: [jane._id],
  });

  await commentModel.create({
    content: 'Can’t wait to see the final UI!',
    author: john._id,
    post: post4._id,
    parentComment: null,
    likedBy: [alice._id],
  });
  console.log('✅ Created comments and replies.');

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
