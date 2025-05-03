import { CreateAccountDTO } from '../../interface';
import { Account } from '@app/common/src/models/account.model';

export class CreateAccountEvent {
  constructor(
    public readonly origin: string,
    public readonly account: Account,
    public readonly payload: CreateAccountDTO,
  ) {}
}

export class SignInEvent {
  constructor(public readonly account: Account) {}
}
