import {
  ApiTags,
  ApiQuery,
  ApiOkResponse,
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { TranslateTextInfo } from '../interface/schema';
import { Query, Req, Controller, Post, Body } from '@nestjs/common';
import { TranslateTextEngineType, TranslateLongTextDto } from '../interface';
import { TranslateLongTextQuery, TranslateTextQuery } from '../commands/impl';

@Controller({ path: 'translation' })
@ApiBearerAuth()
//   @UseGuards(JwtAuthGuard)
export class TranslationController {
  constructor(
    public queryBus: QueryBus,
    public commandBus: CommandBus,
  ) {}

  @ApiTags('translation')
  @Post('translate')
  @ApiOkResponse({ type: TranslateTextInfo })
  @ApiQuery({ name: 'text', example: 'Hello', type: String, required: true })
  @ApiQuery({
    name: 'engine',
    example: 'aws',
    type: String,
    required: false,
  })
  @ApiQuery({
    name: 'sourceLanguage',
    example: 'la',
    type: String,
    required: true,
  })
  @ApiQuery({
    name: 'targetLanguage',
    example: 'en',
    type: String,
    required: true,
  })
  @ApiInternalServerErrorResponse()
  async translateText(
    @Req() req: Request,
    @Query('text') text: string,
    @Query('sourceLanguage') sourceLanguage: string,
    @Query('targetLanguage') targetLanguage: string,
    @Query('engine') engine: TranslateTextEngineType = 'aws',
  ): Promise<TranslateTextInfo> {
    return await this.commandBus.execute(
      new TranslateTextQuery(text, sourceLanguage, targetLanguage, engine),
    );
  }

  @ApiTags('translation')
  @Post('translate-text-long')
  @ApiOkResponse({ type: TranslateTextInfo })
  @ApiQuery({
    name: 'engine',
    example: 'aws',
    type: String,
    required: false,
  })
  @ApiQuery({
    name: 'sourceLanguage',
    example: 'la',
    type: String,
    required: true,
  })
  @ApiQuery({
    name: 'targetLanguage',
    example: 'en',
    type: String,
    required: true,
  })
  @ApiInternalServerErrorResponse()
  async translateLongText(
    @Req() req: Request,
    @Body() body: TranslateLongTextDto,
    @Query('sourceLanguage') sourceLanguage: string,
    @Query('targetLanguage') targetLanguage: string,
    @Query('engine') engine: TranslateTextEngineType = 'aws',
  ): Promise<TranslateTextInfo> {
    return await this.commandBus.execute(
      new TranslateLongTextQuery(body, sourceLanguage, targetLanguage, engine),
    );
  }
}
