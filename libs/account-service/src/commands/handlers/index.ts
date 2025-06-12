import { DeleteAccountHandler } from './DeleteAccountHandler';
import { OrderSanitaryPadHandler } from './OrderSanitaryPadHandler';
import { UpdateAccountNameHandler } from './UpdateAccountNameHandler';
import { UpdateAccountEmailHandler } from './UpdateAccountEmailHandler';
import { UpdateAccountPhoneHandler } from './UpdateAccountPhoneHandler';
import { UpdateProfileImageHandler } from './UpdateProfileImageHandler';
import { UpdateAccountFCMTokenHandler } from './UpdateAccountFCMTokenHandler';
import { UpdateAccountPasswordHandler } from './UpdateAccountPasswordHandler';
import { VerifyNewAccountEmailHandler } from './VerifyNewAccountEmailHandler';
import { UpdateAccountLocationHandler } from './UpdateAccountLocationHandler';
import { RegisterPeriodTrackerHandler } from './RegisterPeriodTrackerHandler';
import { RegisterMonthlySurveyHandler } from './RegisterMonthlySurveyHandler';

export const AccountServiceCommandHandlers = [
  DeleteAccountHandler,
  OrderSanitaryPadHandler,
  UpdateAccountNameHandler,
  UpdateAccountEmailHandler,
  UpdateAccountPhoneHandler,
  UpdateProfileImageHandler,
  RegisterPeriodTrackerHandler,
  UpdateAccountLocationHandler,
  UpdateAccountPasswordHandler,
  VerifyNewAccountEmailHandler,
  UpdateAccountFCMTokenHandler,
  RegisterMonthlySurveyHandler,
];
