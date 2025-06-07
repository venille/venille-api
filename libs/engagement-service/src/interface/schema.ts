import { ApiProperty } from '@nestjs/swagger';

export class TranslateTextInfo {
  @ApiProperty({ example: false, type: Boolean })
  isTranslated: boolean;

  @ApiProperty({ example: 'Hello', type: String })
  translatedText: string;
}
