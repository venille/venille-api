import { ApiProperty } from '@nestjs/swagger';
import { MenstrualPhaseInfo } from '@app/common/src/models/menstrual.phase.model';

export class PreviousCycleInfo {
  @ApiProperty({
    description: 'The start date of the previous cycle',
    example: 'Started on 10th June 2025',
  })
  startDate: string;

  @ApiProperty({
    description: 'The number of days ago the previous cycle started',
    example: '10 days ago',
  })
  daysAgo: string;

  @ApiProperty({
    description: 'The duration of the previous cycle',
    example: 'Period Length: 10 days',
  })
  duration: string;

  @ApiProperty({
    description: 'The status of the duration',
    example: 'Abnormal',
  })
  durationStatus: string;

  @ApiProperty({
    description: 'The cycle length',
    example: 'Cycle length: 28 days',
  })
  cycleLength: string;

  @ApiProperty({
    description: 'The status of the cycle length',
    example: 'Normal',
  })
  cycleLengthStatus: string;
}

export class DashboardInfo {
  @ApiProperty({
    description: 'The previous cycle info',
    type: PreviousCycleInfo,
  })
  previousCycleInfo: PreviousCycleInfo;

  @ApiProperty({
    isArray: true,
    type: MenstrualPhaseInfo,
    description: 'The menstrual phase info',
  })
  menstrualPhases: MenstrualPhaseInfo[];
}
