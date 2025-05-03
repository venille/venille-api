import { ApiProperty } from '@nestjs/swagger';

export class AvailableStateInfo {
  @ApiProperty({
    example: 'Lagos',
    description: 'Name of the state.',
  })
  state: string;

  @ApiProperty({
    example: 'Lagos',
    description: 'Value of the state.',
  })
  stateId: string;

  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
    },
    description: 'Name of the state.',
  })
  lgas: string[];
}
