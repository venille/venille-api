import {
  Get,
  Req,
  Post,
  Controller,
  Body,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOkResponse,
  ApiInternalServerErrorResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { SeederService } from '../services/seeder.service';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('seeder')
@Controller({ path: 'seeder' })
export class SeederController {
  constructor(public readonly seederService: SeederService) {}

}
