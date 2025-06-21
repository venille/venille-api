import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  ValidateNested,
} from 'class-validator';

export class PeriodMonthDto {
  @ApiProperty({ example: '2025-05-22T00:00:00.000Z', type: String })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ example: '2025-05-27T00:00:00.000Z', type: String })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;
}

export class PeriodYearDto {
  @ApiProperty({ example: 2025, type: Number })
  year: number;

  @ApiProperty({ type: PeriodMonthDto, isArray: true })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => PeriodMonthDto)
  months: PeriodMonthDto[];
}

export class PeriodTrackerHistoryDto {
  @ApiProperty({ type: PeriodYearDto, isArray: true })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => PeriodYearDto)
  years: PeriodYearDto[];
}
