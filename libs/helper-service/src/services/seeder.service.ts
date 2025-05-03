import axios from 'axios';
import { Repository } from 'typeorm';
import * as csvParser from 'csv-parse';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { GoogleLocationService } from './google-location.service';
import { AppLogger } from '../../../common/src/logger/logger.service';

@Injectable()
export class SeederService {
  constructor(
    private configService: ConfigService,
    @Inject('Logger') private readonly logger: AppLogger,
    private readonly googleLocationService: GoogleLocationService,
  ) {}

  private parseCSV(csvData: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      csvParser.parse(
        csvData,
        {
          columns: true,
          skip_empty_lines: true,
          trim: true,
        },
        (err, records) => {
          if (err) {
            this.logger.error(`Error parsing CSV: ${err}`);
            reject(err);
          }
          resolve(records);
        },
      );
    });
  }

}
