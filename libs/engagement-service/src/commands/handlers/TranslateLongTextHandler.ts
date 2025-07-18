import { Inject } from '@nestjs/common';
import { TranslateLongTextQuery } from '../impl';
import { TranslateTextInfo } from '../../interface/schema';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppLogger } from 'libs/common/src/logger/logger.service';
import { TextTranslationService } from '@app/helper-service/src/services/text-translation.service';

@CommandHandler(TranslateLongTextQuery)
export class TranslateLongTextHandler
  implements ICommandHandler<TranslateLongTextQuery, TranslateTextInfo>
{
  constructor(
    @Inject('Logger') private readonly logger: AppLogger,
    private readonly textTranslationService: TextTranslationService,
  ) {}

  async execute(command: TranslateLongTextQuery) {
    try {
      this.logger.log(`[TRANSLATE-TEXT-HANDLER-PROCESSING]`);

      const { payload, sourceLanguage, targetLanguage, engine } = command;

      const translatedText = await this.textTranslationService.translateText({
        text: payload.text,
        engine,
        sourceLanguage,
        targetLanguage,
      });

      if (!translatedText) {
        this.logger.log(`[TRANSLATE-TEXT-HANDLER-FAILED]`);

        return {
          translatedText: '',
          isTranslated: false,
        };
      }

      this.logger.log(`[TRANSLATE-TEXT-HANDLER-SUCCESS]`);

      return {
        translatedText,
        isTranslated: true,
      };
    } catch (error) {
      this.logger.log(`[TRANSLATE-TEXT-HANDLER-ERROR] :: ${error}`);
      console.log(error);

      throw error;
    }
  }
}
