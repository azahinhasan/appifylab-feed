import { IsNotEmpty, IsOptional, IsString, IsMongoId } from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty()
  @IsString()
  content: string;

  @IsOptional()
  @IsMongoId()
  parentComment?: string;
}
