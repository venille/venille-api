import {
  ApiTags,
  ApiBody,
  ApiQuery,
  ApiResponse,
  ApiConsumes,
  ApiOperation,
} from '@nestjs/swagger';
import {
  Post,
  Query,
  Controller,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileUploadResult } from '../interface';
import { FileInterceptor } from '@nestjs/platform-express';
import { OptimizedImageType } from 'libs/common/src/constants/enums';
import { ImageUploadService } from '../services/image-upload.service';

/**
 * @Controller('upload')
 * Handles file upload operations, specifically for images and general files.
 */
@ApiTags('upload')
@Controller('upload')
export class ImageUploadController {
  constructor(private readonly imageUploadService: ImageUploadService) {}

  /**
   * Uploads an image to Cloudinary with optional transformations.
   *
   * @param file - The image file to be uploaded, provided by Multer.
   * @param width - Optional width for image resizing.
   * @param height - Optional height for image resizing.
   * @returns The URL and public ID of the uploaded image.
   */
  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload an image with optional resizing' })
  @ApiResponse({
    description: 'Image uploaded successfully',
    type: FileUploadResult,
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: OptimizedImageType,
  })
  @ApiConsumes('multipart/form-data') // Set content type as multipart/form-data
  @ApiBody({
    description: 'Upload an image file',
    required: true,
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Query('type') type: OptimizedImageType = OptimizedImageType.coverImage,
  ) {
    return await this.imageUploadService.uploadImageToAws(file, type);
  }

  /**
   * Uploads an image to Cloudinary with optional transformations.
   *
   * @param file - The image file to be uploaded, provided by Multer.
   * @param width - Optional width for image resizing.
   * @param height - Optional height for image resizing.
   * @returns The URL and public ID of the uploaded image.
   */
  @Post('file')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload an file' })
  @ApiResponse({
    description: 'File uploaded successfully',
    type: FileUploadResult,
  })
  @ApiConsumes('multipart/form-data') // Set content type as multipart/form-data
  @ApiBody({
    description: 'Upload an file',
    required: true,
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.imageUploadService.uploadFileToAws(file);
  }
}
