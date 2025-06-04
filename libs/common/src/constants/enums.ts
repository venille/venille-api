export enum AccountType {
  INDIVIDUAL = 'individual',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
  SYSTEM = 'system',
}

export enum AccountStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SHADOW_BANNED = 'shadow_banned',
  DISABLED = 'disabled',
}

export enum OptimizedImageType {
  thumbnail = 'thumbnail',
  logo = 'logo',
  productImage = 'product-image',
  coverImage = 'cover-image',
  medium = 'medium',
  large = 'large',
}

export enum ForumCategory {
  GENERAL = 'general',
  HEALTH = 'health',
  FITNESS = 'fitness',
  NUTRITION = 'nutrition',
  MENTAL_HEALTH = 'mental-health',
  MENSTRUAL_CYCLE = 'menstrual-cycle',
  SEXUAL_HEALTH = 'sexual-health',
  CONTRACEPTION = 'contraception',
  RELATIONSHIPS = 'relationships',
  FAMILY = 'family',
  BEAUTY_AND_WELLNESS = 'beauty-and-wellness',
  PREGNANCY = 'pregnancy',
  PARENTHOOD = 'parenthood',
}

export enum CourseCategory {
  UNDERSTANDING_YOUR_BODY = 'understanding-your-body',
  SEXUAL_PLEASURE_AND_WELLNESS = 'sexual-pleasure-and-wellness',
  MENTAL_AND_EMOTIONAL_WELL_BEING = 'mental-and-emotional-well-being',
  MENOPAUSE_AND_MIDLIFE_HEALTH = 'menopause-and-midlife-health',
  CONTRACEPTION_AND_FAMILY_PLANNING = 'contraception-and-family-planning',
  MENSTRUAL_HEALTH_AND_HYGIENE = 'menstrual-health-and-hygiene',
  SEXUAL_AND_REPRODUCTIVE_RIGHTS = 'sexual-and-reproductive-rights',
  SEXUALLY_TRANSMITTED_INFECTIONS = 'sexually-transmitted-infections',
  FERTILITY_AND_INFERTILITY = 'fertility-and-infertility',
  PREGNANCY_AND_POSTPARTUM_CARE = 'pregnancy-and-postpartum-care',
}

export enum PeriodSymptom {
  CRAMPS = 'cramps',
  BLOATING = 'bloating',
  MOOD_SWINGS = 'mood_swings',
  HEADACHE = 'headache',
  ACNE = 'acne',
  FATIGUE = 'fatigue',
  TENDER_BREASTS = 'tender_breasts',
  NAUSEA = 'nausea',
  OTHER = 'other',
}

export enum BirthControlMethod {
  NONE = 'none',
  PILL = 'pill',
  IUD = 'iud',
  IMPLANT = 'implant',
  INJECTION = 'injection',
  PATCH = 'patch',
  CONDOM = 'condom',
  NATURAL = 'natural',
  OTHER = 'other',
}

export enum HealthCondition {
  PCOS = 'pcos',
  ENDOMETRIOSIS = 'endometriosis',
  THYROID = 'thyroid',
  DIABETES = 'diabetes',
  FIBROIDS = 'fibroids',
  BLOOD_DISORDER = 'blood_disorder',
  OTHER = 'other',
}

export enum AdditionalTracking {
  MOOD = 'mood',
  DISCHARGE = 'discharge',
  TEMPERATURE = 'temperature',
  CERVICAL_POSITION = 'cervical_position',
  SLEEP = 'sleep',
  SEX = 'sex',
  EXERCISE = 'exercise',
  NUTRITION = 'nutrition',
  OTHER = 'other',
}

export enum ReminderType {
  PERIOD_START = 'period_start',
  FERTILE_WINDOW = 'fertile_window',
  OVULATION = 'ovulation',
  MEDICATION = 'medication',
  CUSTOM = 'custom',
}

export enum CycleGoal {
  JUST_TRACKING = 'just_tracking',
  TRYING_TO_CONCEIVE = 'trying_to_conceive',
  AVOIDING_PREGNANCY = 'avoiding_pregnancy',
  MONITORING_HEALTH = 'monitoring_health',
}

export enum OnboardingQuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  DATE_RANGE = 'date_range',
  TEXT = 'text',
  NUMBER = 'number',
  DATE = 'date',
  BOOLEAN = 'boolean',
}

export enum OnboardingQuestionOptionType {
  TEXT = 'text',
  NUMBER = 'number',
  DATE = 'date',
  BOOLEAN = 'boolean',
}

export enum QuestionEnumType {
  PeriodSymptom = 'PeriodSymptom',
  BirthControlMethod = 'BirthControlMethod',
  HealthCondition = 'HealthCondition',
  AdditionalTracking = 'AdditionalTracking',
  ReminderType = 'ReminderType',
  CycleGoal = 'CycleGoal',
  General = 'General',
}


