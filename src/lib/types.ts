import type { Timestamp } from "firebase/firestore";

export interface UserProfile {
  userId: string;
  email: string | null;
  phoneNumber: string | null;
  displayName: string | null;
  photoURL: string | null;
  authProvider: string; // e.g., 'email', 'google.com', 'apple.com', 'phone'
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt: Timestamp;
  isActive: boolean;
  roles: string[]; // e.g., ['user', 'affiliate_tier_1']
  customClaims: {
    loyaltyTier?: string | null; // e.g., 'bronze', 'silver', 'gold'
    isVIP?: boolean | null;
    [key: string]: any; // For canAccess[FeatureName]
  };
  preferences: {
    preferredAirport?: string | null;
    notificationSettings: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    valuesBasedFilters: string[]; // e.g., ['local_business', 'minority_owned']
  };
  affiliateInfo?: {
    affiliateId: string;
    uplineAffiliateId?: string | null;
    tierInUpline?: number; // 1, 2, 3, etc.
    cookieDurationDays?: number;
    qrCodeUrl?: string;
    downlineCount?: number;
  } | null;
  linkedVendorId?: string | null;
  deviceTokens?: string[];
}
