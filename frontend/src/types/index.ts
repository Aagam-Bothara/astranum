// AstraVaani TypeScript Types

// Guidance modes
export type GuidanceMode = 'astrology' | 'numerology' | 'both';

// Supported languages
export type Language = 'en' | 'hi' | 'hinglish';

// Response styles
export type ResponseStyle = 'supportive' | 'balanced' | 'direct';

// Subscription tiers
export type SubscriptionTier = 'free' | 'starter' | 'pro' | 'max';

// User profile
export interface UserProfile {
  id: string;
  fullName: string;
  displayName?: string;
  dateOfBirth: string;
  timeOfBirth?: string;
  placeOfBirth?: string;
  guidanceMode: GuidanceMode;
  language: Language;
  response_style?: ResponseStyle;
}

// Numerology data from computation
export interface NumerologyData {
  lifePath: number;
  destinyNumber: number;
  soulUrge: number;
  personality: number;
  birthDay: number;
  nameUsed: string;
}

// Planet position
export interface PlanetPosition {
  sign: string;
  degree: number;
}

// Astrology data from computation
export interface AstrologyData {
  sunSign: PlanetPosition;
  moonSign: PlanetPosition;
  ascendant?: PlanetPosition;
  planets: Record<string, PlanetPosition>;
  moonNakshatra?: string;
  houses?: Record<string, { sign: string; degree: number }>;
  hasBirthTime: boolean;
}

// Chart snapshot
export interface ChartSnapshot {
  id: string;
  mode: GuidanceMode;
  version: number;
  numerologyData?: NumerologyData;
  astrologyData?: AstrologyData;
  transitData?: {
    date: string;
    planets: Record<string, PlanetPosition>;
  };
  createdAt: string;
}

// Guidance request
export interface GuidanceRequest {
  question: string;
  mode?: GuidanceMode;
  language?: Language;
}

// Validation result
export interface ValidationResult {
  passed: boolean;
  issues: string[];
  wasRegenerated: boolean;
}

// Guidance response
export interface GuidanceResponse {
  empathyLine: string;
  reasons: string[];
  direction: string;
  caution?: string;
  dataPointsUsed: string[];
  validation: ValidationResult;
  fullResponse: string;
}

// Message in chat
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    dataPointsUsed?: string[];
    validationPassed?: boolean;
  };
}

// Usage status
export interface UsageStatus {
  tier: SubscriptionTier;
  dailyLimit: number;
  dailyUsed: number;
  dailyRemaining: number;
  monthlyLimit: number;
  monthlyUsed: number;
  monthlyRemaining: number;
  lifetimeLimit?: number;
  lifetimeUsed?: number;
  lifetimeRemaining?: number;
  maxResponseChars: number;
  canAskQuestion: boolean;
  limitMessage?: string;
}

// Subscription
export interface Subscription {
  tier: SubscriptionTier;
  status: 'active' | 'cancelled' | 'expired' | 'paused';
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  priceDisplay: string;
}

// API Response wrapper
export interface ApiResponse<T> {
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

// Admin types
export interface TierBreakdown {
  tier: string;
  count: number;
}

export interface AdminStats {
  total_users: number;
  active_users_30d: number;
  total_subscriptions: number;
  active_subscriptions: number;
  revenue_this_month_paise: number;
  revenue_total_paise: number;
  questions_today: number;
  questions_this_month: number;
  tier_breakdown: TierBreakdown[];
}

export interface AdminUser {
  id: string;
  email: string;
  phone_number?: string;
  full_name?: string;
  tier: string;
  status: string;
  is_active: boolean;
  questions_used_monthly: number;
  created_at: string;
}

export interface AdminUserList {
  users: AdminUser[];
  total: number;
  page: number;
  page_size: number;
}

export interface AdminSubscription {
  id: string;
  user_email: string;
  user_name?: string;
  tier: string;
  status: string;
  amount_paise: number;
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  current_period_start?: string;
  current_period_end?: string;
  cancel_at_period_end: boolean;
  created_at: string;
}

export interface AdminSubscriptionList {
  subscriptions: AdminSubscription[];
  total: number;
  page: number;
  page_size: number;
}
