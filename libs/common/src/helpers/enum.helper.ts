import { MonthlySurveyPeriodDuration } from '../constants/enums';

export function FormatMonthlySurveyPeriodDurationEnum(
  duration: MonthlySurveyPeriodDuration,
): string {
  switch (duration) {
    case MonthlySurveyPeriodDuration.None:
      return 'None';
    case MonthlySurveyPeriodDuration.OneToThreeDays:
      return 'One to Three Days';
    case MonthlySurveyPeriodDuration.FourToFiveDays:
      return 'Four to Five Days';
    case MonthlySurveyPeriodDuration.MoreThanFiveDays:
      return 'More Than Five Days';
    default:
      return 'None';
  }
}