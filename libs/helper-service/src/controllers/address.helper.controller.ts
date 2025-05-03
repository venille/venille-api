import { QueryBus } from '@nestjs/cqrs';
import { Get, Req, Controller } from '@nestjs/common';
import { AvailableStateInfo } from '../interface/schema';
import { FetchAvailableStatesQuery } from '../queries/impl';
import { ApiTags, ApiOkResponse, ApiConflictResponse } from '@nestjs/swagger';

@ApiTags('address-helper')
@Controller({ path: 'address-helper' })
export class AddressHelperController {
  constructor(private queryBus: QueryBus) {}

  @ApiTags('address-helper')
  @Get('available-states')
  @ApiOkResponse({ type: AvailableStateInfo, isArray: true })
  @ApiConflictResponse()
  async getAvailableStates(@Req() req: Request): Promise<AvailableStateInfo[]> {
    return await this.queryBus.execute(new FetchAvailableStatesQuery());
  }
}
