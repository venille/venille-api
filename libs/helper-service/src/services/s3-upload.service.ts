import { BadGatewayException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  S3,
  PutObjectCommand,
  PutObjectCommandInput,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3UploadService {
  private s3 = new S3({ region: 'eu-north-1' });

  constructor(private readonly configService: ConfigService) {
    this.s3 = new S3({ region: this.configService.get<string>('AWS_REGION') });
  }

  private generateS3Key(file: Express.Multer.File): string {
    const extension = file.originalname.split('.').pop(); // Get the file extension
    return `uploads/${randomUUID()}.${extension}`; // Generate a unique key with the extension
  }

  public async uploadFileToS3(file: Express.Multer.File, key: string): Promise<any> {
    try {
      // const key = this.generateS3Key(file);
      const params: PutObjectCommandInput = {
        Bucket: this.configService.get<string>('AWS_BUCKET_NAME'),
        Key: key,
        Body: file.buffer,
        ACL: 'public-read-write',
        ContentType: file.mimetype,
      };

      const command = new PutObjectCommand(params);
      const uploadResult = await this.s3.send(command);

      return { Key: key, Bucket: this.configService.get<string>('AWS_BUCKET_NAME'), ...uploadResult };
    } catch (error) {
      throw new BadGatewayException(`Error uploading to S3: ${error.message}`);
    }
  }

  public async uploadBufferToS3(
    buffer: Buffer,
    key: string,
    mimetype: string,
  ): Promise<{
    Key: string;
    Bucket: string;
  }> {
    try {
      const params: PutObjectCommandInput = {
        Bucket: this.configService.get<string>('AWS_BUCKET_NAME'),
        Key: key,
        Body: buffer,
        ACL: 'public-read-write',
        ContentType: mimetype,
      };

      const command = new PutObjectCommand(params);
      const uploadResult = await this.s3.send(command);

      return { Key: key, Bucket: this.configService.get<string>('AWS_BUCKET_NAME'), ...uploadResult };
    } catch (error) {
      throw new BadGatewayException(`Error uploading to S3: ${error.message}`);
    }
  }

  public async uploadUnit8ArrayToS3(
    arr: any,
    mimetype: 'application/pdf',
    extension: string,
  ): Promise<{ Key: string; Bucket: string }> {
    function generateS3Key(): string {
      return `uploads/${randomUUID()}.${extension}`; // Generate a unique key with the extension
    }

    try {
      const key = generateS3Key();
      const buffer = Buffer.from(arr);
      const params: PutObjectCommandInput = {
        Bucket: this.configService.get<string>('AWS_BUCKET_NAME'),
        Key: key,
        Body: buffer,
        ACL: 'public-read-write',
        ContentType: mimetype,
      };

      const command = new PutObjectCommand(params);
      const uploadResult = await this.s3.send(command);
      return { Key: key, Bucket: this.configService.get<string>('AWS_BUCKET_NAME'), ...uploadResult };
    } catch (error) {
      throw new BadGatewayException(`Error uploading to S3: ${error.message}`);
    }
  }
}
