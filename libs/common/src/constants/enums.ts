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
