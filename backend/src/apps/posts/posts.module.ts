import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { UploadModule } from '../upload/upload.module';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

@Module({
  imports: [DatabaseModule, UploadModule],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
