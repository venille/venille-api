import { Get, Req, Patch, Controller, Body } from '@nestjs/common';
import {
  ApiTags,
} from '@nestjs/swagger';
import { AdminService } from '../services/admin.service';

@ApiTags('admin')
@Controller({ path: 'admin' })
export class AdminController {
  constructor(public readonly adminService: AdminService) { }

  @Patch('fetch-default-image')
  async fetchDefaultImage(): Promise<void> {
    return this.adminService.fetchDefaultImage();
  }

  @Patch('update-account-profiles')
  async updateAccountProfiles(): Promise<void> {
    return this.adminService.updateAccountProfile();
  }

  @Patch('update-course-cover-photos')
  async updateCourseCoverPhotos(): Promise<void> {
    return this.adminService.updateCourseCoverPhotos();
  }
}
