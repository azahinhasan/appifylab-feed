import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './apps/auth/auth.module';
import { UsersModule } from './apps/users/users.module';
import { PostsModule } from './apps/posts/posts.module';
import { CommentsModule } from './apps/comments/comments.module';
import { UploadModule } from './apps/upload/upload.module';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI') || 'mongodb://127.0.0.1:27017/social-feed',
      }),
    }),
    ThrottlerModule.forRoot([{
      ttl: 15 * 60 * 1000, // 15 minutes in milliseconds
      limit: 5, // 5 requests
    }]),
    DatabaseModule,
    AuthModule,
    UsersModule,
    PostsModule,
    CommentsModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
