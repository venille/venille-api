import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

export const EmailAlreadyUsedException = () =>
  new ConflictException('Email is already in use.');

export const AlreadyExistsException = (message: string) =>
  new ConflictException(message);

export const AppointmentAlreadyExistsException = (donationCenter: string) =>
  new ConflictException(
    `You already have a pending appointment with ${donationCenter}. Please wait for your appointment to be completed or cancel it before creating a new one.`,
  );

export const UnauthorizedDonorException = () =>
  new ForbiddenException(
    'Sorry, you are not eligible to donate blood at the moment. We will notify you when you are eligible again.',
  );

export const UserNotFoundException = () =>
  new NotFoundException('Requested user does not exist.');

export const ActivationTokenInvalidException = () =>
  new ForbiddenException('Activation token is invalid or has expired.');

export const PasswordResetTokenInvalidException = () =>
  new ForbiddenException('Password reset token is invalid or has expired.');

export const LoginCredentialsException = () =>
  new UnauthorizedException('Login credentials are wrong.');

export const ResourceNotFoundException = () =>
  new NotFoundException('Resource not found.');
