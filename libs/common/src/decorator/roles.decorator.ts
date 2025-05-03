/* eslint-disable prettier/prettier */

import { SetMetadata } from '@nestjs/common';
import { AccountType } from '../constants/enums';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: AccountType[]) => SetMetadata(ROLES_KEY, roles);
