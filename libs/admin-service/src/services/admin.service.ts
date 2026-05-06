import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { Forum } from '@app/common/src/models/forum.model';
import { Course } from '@app/common/src/models/course.model';
import { AccountType } from 'libs/common/src/constants/enums';
import { Account } from 'libs/common/src/models/account.model';
import { AppLogger } from '../../../common/src/logger/logger.service';
import { ImageUploadService } from 'libs/helper-service/src/services/image-upload.service';

@Injectable()
export class AdminService {
  constructor(
    private configService: ConfigService,
    private readonly imageUploadService: ImageUploadService,
    @Inject('Logger') private readonly logger: AppLogger,
    @InjectRepository(Forum)
    private readonly forumRepository: Repository<Forum>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) { }

  async fetchDefaultImage() {
    try {
      this.logger.log(`[UPDATE-DONATION-CENTER-PROFILE-PROCESSING]`);

      const response = await fetch('https://afritint-media.s3.eu-north-1.amazonaws.com/versions/original/36c0b149-a6af-481e-a251-dd3138510afc.png');
      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();

        const buffer = Buffer.from(arrayBuffer);
        const mimetype = response.headers.get('content-type') || 'image/jpeg';

        const mockFile = {
          buffer,
          mimetype,
          originalname: '_logo',
        } as Express.Multer.File;

        const uploadResult = await this.imageUploadService.uploadFileToAws(mockFile);

        console.log({ uploadResult });
      }

      this.logger.log(`[UPDATE-DONATION-CENTER-PROFILE-SUCCESS]`);
    } catch (error) {
      this.logger.error(`[UPDATE-DONATION-CENTER-PROFILE-ERROR] :: ${error}`);
      throw error;
    }
  }

  async updateCourseCoverPhotos() {
    try {
      this.logger.log(`[UPDATE-COURSE-COVER-PHOTOS-PROCESSING]`);

      const courses = await this.courseRepository.find({});

      await Promise.all(courses.map(async (course) => {
        try {
          this.logger.log(`[UPDATE-COURSE-COVER-PHOTOS-MANAGER-PROCESSING]`);
          const response = await fetch(course.coverPhoto);

          if (response.ok) {
            const arrayBuffer = await response.arrayBuffer();

            const buffer = Buffer.from(arrayBuffer);

            const mimetype = response.headers.get('content-type') || 'image/jpeg';

            const mockFile = {
              buffer,
              mimetype,
              originalname: course.title + '_cover-photo',
            } as Express.Multer.File;

            const uploadResult = await this.imageUploadService.uploadFileToAws(mockFile);

            course.coverPhoto = uploadResult.url;

            console.log({ uploadResult });

            await this.courseRepository.save(course);
          }

          setTimeout(() => {
          }, 4000);
          this.logger.log(`[UPDATE-COURSE-COVER-PHOTOS-MANAGER-SUCCESS]`);
        } catch (error) {
          this.logger.error(`[UPDATE-COURSE-COVER-PHOTOS-MANAGER-ERROR] :: ${error}`);
          console.log(error, ' --ERROR-- ');
        }
      }));

      this.logger.log(`[UPDATE-COURSE-COVER-PHOTOS-SUCCESS]`);
    } catch (error) {
      this.logger.error(`[UPDATE-COURSE-COVER-PHOTOS-ERROR] :: ${error}`);
      throw error;
    }
  }

  async updateAccountProfile() {
    try {
      this.logger.log(`[UPDATE-PROFILE-PROCESSING]`);

      const accounts = await this.accountRepository.find({
        where: {
          // accountType: AccountType.INDIVIDUAL,
        },
      });

      await Promise.all(accounts.map(async (account) => {
        try {
          this.logger.log(`[UPDATE-PROFILE-MANAGER-PROCESSING]`);
          account.profilePhoto = 'https://afritint-media.s3.eu-north-1.amazonaws.com/versions/original/5415ab65-fcc2-45f7-9ef7-c4decf861019.png';

          await this.accountRepository.save(account);

          // const response = await fetch(account.profilePhoto);

          // if (response.ok) {
          //   const arrayBuffer = await response.arrayBuffer();

          //   const buffer = Buffer.from(arrayBuffer);

          //   const mimetype = response.headers.get('content-type') || 'image/jpeg';

          //   const mockFile = {
          //     buffer,
          //     mimetype,
          //     originalname: account.firstName + '_profile-photo',
          //   } as Express.Multer.File;

          //   const uploadResult = await this.imageUploadService.uploadFileToAws(mockFile);

          //   account.profilePhoto = uploadResult.url;

          //   console.log({ uploadResult });

          //   await this.accountRepository.save(account);
          // }

          setTimeout(() => {
          }, 4000);
          this.logger.log(`[UPDATE-PROFILE-MANAGER-SUCCESS]`);
        } catch (error) {
          this.logger.error(`[UPDATE-PROFILE-MANAGER-ERROR] :: ${error}`);
          console.log(error, ' --ERROR-- ', account.profilePhoto);
        }
      }));

      this.logger.log(`[UPDATE-PROFILE-SUCCESS]`);
    } catch (error) {
      this.logger.error(`[UPDATE-PROFILE-ERROR] :: ${error}`);
      throw error;
    }
  }
}
