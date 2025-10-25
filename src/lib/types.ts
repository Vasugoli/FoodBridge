export type UserRole = 'donor' | 'distributor' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
  createdAt: Date;
}

export type DonationStatus = 'available' | 'claimed' | 'completed' | 'expired';

export interface Donation {
  id: string;
  title: string;
  description: string;
  quantity: string; // e.g., "10 meals", "2 boxes"
  expiry: Date;
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  imageUrl: string;
  imageHint: string;
  status: DonationStatus;
  donor: User;
  claimedBy?: User;
  createdAt: Date;
}
