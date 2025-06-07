import axios from 'axios';
import * as crypto from 'crypto';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Formality,
  TranslateClient,
  TranslateTextCommand,
} from '@aws-sdk/client-translate'; // ES
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { TranslateTextEngineType } from '@app/engagement-service/src/interface';

interface SupportedLanguage {
  language: string;
  name: string;
}

@Injectable()
export class TextTranslationService {
  private readonly apiKey: string;
  private readonly translateClient: TranslateClient;
  // Medical terms that should not be translated

  constructor(
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {
    this.apiKey = this.configService.get<string>('GOOGLE_CLOUD_API_KEY');
    this.translateClient = new TranslateClient({
      region: this.configService.get<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>(
          'AWS_SECRET_ACCESS_KEY',
        ),
      },
    });
  }

  async getSupportedLanguages(
    target?: string,
    source?: string,
  ): Promise<SupportedLanguage[]> {
    try {
      const url = `https://translation.googleapis.com/language/translate/v2/languages?key=${this.apiKey}&target=${target}&source=${source}`;

      const { data } = await axios.get(url);

      if (!data?.data?.languages) {
        throw new Error('No languages returned from Google Translation API');
      }

      return data.data.languages;
    } catch (error) {
      throw error;
    }
  }

  async translateText(payload: {
    text: string;
    sourceLanguage: string;
    targetLanguage: string;
    engine: TranslateTextEngineType;
  }): Promise<string> {
    try {
      const { text, sourceLanguage, targetLanguage, engine } = payload;

      if (engine === 'google') {
        return this.googleTranslateText(text, sourceLanguage, targetLanguage);
      } else if (engine === 'aws') {
        return this.awsTranslateText(text, sourceLanguage, targetLanguage);
      }

      throw new Error('Unsupported engine');
    } catch (error) {
      console.error('[TRANSLATE-TEXT-ERROR] :: ', error);
      throw error;
    }
  }

  async getHash(text: string): Promise<string> {
    try {
      const hash = crypto.createHash('sha256').update(text).digest('hex');

      console.log('[GENERATED-HASH] :: ', hash);

      return hash;
    } catch (cryptoError) {
      console.error('[CRYPTO-ERROR] :: ', cryptoError);
      // Generate a fallback hash if crypto fails
      return Buffer.from(text).toString('base64');
    }
  }

  async awsTranslateText(
    text: string,
    sourceLanguage: string,
    targetLanguage: string,
  ): Promise<string> {
    try {
      const hash = await this.getHash(text);

      const cacheKey = `${sourceLanguage}-${targetLanguage}-${hash}`;

      const cachedResult = await this.cacheManager.get<string>(cacheKey);

      if (cachedResult) {
        console.log('[TRANSLATE-TEXT-CACHE-HIT] :: ', cacheKey);

        return cachedResult;
      }

      const input = new TranslateTextCommand({
        // TranslateTextRequest
        Text: text,
        TerminologyNames: [
          // ResourceNameList
          // "STRING_VALUE",
        ],
        SourceLanguageCode: sourceLanguage,
        TargetLanguageCode: targetLanguage,
        Settings: {
          Formality: Formality.FORMAL,
          // Profanity: 'MASK',
          // Brevity: "ON",
        },
      });

      const response = await this.translateClient.send(input);

      const translatedText = response.TranslatedText;

      const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
      
      await this.cacheManager.set(cacheKey, translatedText, CACHE_TTL_MS);

      return translatedText;
    } catch (error) {
      throw error;
    }
  }

  async googleTranslateText(
    text: string,
    sourceLanguage: string,
    targetLanguage: string,
  ): Promise<string> {
    try {
      const hash = await this.getHash(text);

      const cacheKey = `${sourceLanguage}-${targetLanguage}-${hash}`;

      const cachedResult = await this.cacheManager.get<string>(cacheKey);

      if (cachedResult) {
        console.log('[AWS-TRANSLATE-TEXT-CACHE-HIT] :: ', cacheKey);

        return cachedResult;
      }

      const { data } = await axios.post(
        `https://translation.googleapis.com/language/translate/v3?key=${this.apiKey}&q=${text}&source=${sourceLanguage}&target=${targetLanguage}`,
      );

      if (!data?.data?.translations?.length) {
        throw new Error('No translations returned from Google Translation API');
      }

      const translatedText = data.data.translations.find(
        (translation) => translation,
      )?.translatedText;

      const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
      await this.cacheManager.set(cacheKey, translatedText, CACHE_TTL_MS);

      return translatedText;
    } catch (error) {
      throw error;
    }
  }
}
