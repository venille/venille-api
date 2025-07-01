import { Repository } from 'typeorm';
import { Inject } from '@nestjs/common';
import { ReportAIResponseCommand } from '../impl';
import { InjectRepository } from '@nestjs/typeorm';
import { Report } from 'libs/common/src/models/report.model';
import { Account } from 'libs/common/src/models/account.model';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AppLogger } from 'libs/common/src/logger/logger.service';
import { UserNotFoundException } from 'libs/common/src/constants/exceptions';

@CommandHandler(ReportAIResponseCommand)
export class ReportAIResponseHandler
  implements ICommandHandler<ReportAIResponseCommand>
{
  constructor(
    @Inject('Logger') private readonly logger: AppLogger,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
  ) {}

  async execute(command: ReportAIResponseCommand) {
    try {
      this.logger.log(`[REPORT-AI-RESPONSE-HANDLER-PROCESSING]`);

      const { payload, secureUser } = command;

      const account = await this.accountRepository.findOne({
        where: {
          id: secureUser.id,
        },
      });

      if (!account) {
        throw UserNotFoundException();
      }

      const report = this.reportRepository.create({
        prompt: payload.prompt,
        responseType: payload.responseType,
        account,
      });

      await this.reportRepository.save(report);

      this.logger.log(`[REPORT-AI-RESPONSE-HANDLER-SUCCESS]`);
    } catch (error) {
      this.logger.log(`[REPORT-AI-RESPONSE-HANDLER-ERROR] :: ${error}`);

      throw error;
    }
  }
}
