import { ApiProperty } from '@nestjs/swagger';

export class PhoneContactInfo {
  @ApiProperty({
    type: String,
    example: '23',
  })
  id: string;

  @ApiProperty({
    type: String,
    example: '+2349092019099',
  })
  phoneNumber: string;
}
