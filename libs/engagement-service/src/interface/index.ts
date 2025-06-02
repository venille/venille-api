import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { ForumCategory } from '@app/common/src/constants/enums';

export class CreateForumDto {
  @ApiProperty({
    example: 'My first forum',
    description: 'The title of the forum',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'This is a forum about the latest trends in technology',
    description: 'The description of the forum',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: 'https://example.com/image.png',
    description: 'The image of the forum',
  })
  @IsString()
  @IsNotEmpty()
  image: string;

  // @ApiProperty({
  //   enum: ForumCategory,
  //   example: ForumCategory.GENERAL,
  //   description: 'The category of the forum',
  // })
  // @IsEnum(ForumCategory)
  // @IsNotEmpty()
  // category: ForumCategory;
}

export class CreateForumCommentDto {
  @ApiProperty({
    example: 'This is a comment',
    description: 'The content of the comment',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}