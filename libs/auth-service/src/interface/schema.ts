import { ApiProperty } from '@nestjs/swagger';
import { GenerateContentResponse } from '@google/genai';

export class GirlifiedAIInfo {
  @ApiProperty({ type: String })
  text: GenerateContentResponse['text'];

  @ApiProperty({ type: String })
  threadId: string;
}
