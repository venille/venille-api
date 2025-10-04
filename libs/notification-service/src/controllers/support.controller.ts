import {
  ApiTags,
  ApiOkResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { ContactUsDTO, GirlifiedBioContactUsDTO } from '../interface';
import { SupportService } from '../services/support.service';
import { Get, Req, Post, Controller, Body } from '@nestjs/common';

@Controller({ path: 'support' })
export class SupportController {
  constructor(public readonly supportService: SupportService) {}

  @ApiTags('support')
  @Post('contact-us')
  @ApiOkResponse()
  @ApiInternalServerErrorResponse()
  async contactUs(@Req() req: Request, @Body() body: ContactUsDTO) {
    return await this.supportService.handleContactUsService(body);
  }

  @ApiTags('girlified-support')
  @Post('girlified-bio-contact-us')
  @ApiOkResponse()
  @ApiInternalServerErrorResponse()
  async girlifiedBioContactUs(
    @Req() req: Request,
    @Body() body: GirlifiedBioContactUsDTO,
  ) {
    return await this.supportService.handleGirlifiedBioContactUsService(body);
  }
}
