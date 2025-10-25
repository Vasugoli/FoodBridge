import type { User, Donation, UserRole } from './types';
import { PlaceHolderImages } from './placeholder-images';

const avatar1 = PlaceHolderImages.find(i => i.id === 'avatar-1')?.imageUrl || '';
const avatar2 = PlaceHolderImages.find(i => i.id === 'avatar-2')?.imageUrl || '';
const avatar3 = PlaceHolderImages.find(i => i.id === 'avatar-3')?.imageUrl || '';

export const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'Admin User',
    email: 'admin@foodbridge.com',
    role: 'admin',
    avatarUrl: avatar1,
    createdAt: new Date('2023-01-01'),
  },
  {
    id: 'user-2',
    name: 'Dana the Donor',
    email: 'donor@foodbridge.com',
    role: 'donor',
    avatarUrl: avatar2,
    createdAt: new Date('2023-02-15'),
  },
  {
    id: 'user-3',
    name: 'David the Distributor',
    email: 'distributor@foodbridge.com',
    role: 'distributor',
    avatarUrl: avatar3,
    createdAt: new Date('2023-03-10'),
  },
  {
    id: 'user-4',
    name: 'Local Restaurant',
    email: 'restaurant@example.com',
    role: 'donor',
    avatarUrl: avatar1,
    createdAt: new Date('2023-04-01'),
  },
  {
    id: 'user-5',
    name: 'Community Shelter',
    email: 'shelter@example.com',
    role: 'distributor',
    avatarUrl: avatar2,
    createdAt: new Date('2023-05-20'),
  }
];

const foodImages = {
  "1": PlaceHolderImages.find(i => i.id === 'donation-1')!,
  "2": PlaceHolderImages.find(i => i.id === 'donation-2')!,
  "3": PlaceHolderImages.find(i => i.id === 'donation-3')!,
  "4": PlaceHolderImages.find(i => i.id === 'donation-4')!,
}

export const mockDonations: Donation[] = [
  {
    id: 'donation-1',
    title: 'Surplus bread from bakery',
    description: 'A mix of whole wheat and white bread loaves, still fresh.',
    quantity: '2 boxes',
    expiry: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000), // Expires in 2 days
    location: { address: '123 Main St, Anytown, USA', lat: 34.0522, lng: -118.2437 },
    imageUrl: foodImages["1"].imageUrl,
    imageHint: foodImages["1"].imageHint,
    status: 'available',
    donor: mockUsers[1],
    createdAt: new Date(new Date().getTime() - 1 * 60 * 60 * 1000), // Created 1 hour ago
  },
  {
    id: 'donation-2',
    title: 'Fresh vegetables from farmer\'s market',
    description: 'Crates of tomatoes, cucumbers, and bell peppers.',
    quantity: '5 crates',
    expiry: new Date(new Date().getTime() + 1 * 24 * 60 * 60 * 1000), // Expires in 1 day
    location: { address: '456 Oak Ave, Anytown, USA', lat: 34.055, lng: -118.25 },
    imageUrl: foodImages["2"].imageUrl,
    imageHint: foodImages["2"].imageHint,
    status: 'claimed',
    donor: mockUsers[3],
    claimedBy: mockUsers[2],
    createdAt: new Date(new Date().getTime() - 5 * 60 * 60 * 1000), // Created 5 hours ago
  },
  {
    id: 'donation-3',
    title: 'Catering leftovers: Sandwiches',
    description: 'Assorted sandwich platters from a corporate event.',
    quantity: '3 large trays',
    expiry: new Date(new Date().getTime() + 6 * 60 * 60 * 1000), // Expires in 6 hours
    location: { address: '789 Pine Ln, Anytown, USA', lat: 34.04, lng: -118.26 },
    imageUrl: foodImages["3"].imageUrl,
    imageHint: foodImages["3"].imageHint,
    status: 'available',
    donor: mockUsers[1],
    createdAt: new Date(new Date().getTime() - 30 * 60 * 1000), // Created 30 mins ago
  },
  {
    id: 'donation-4',
    title: 'Organic Milk Cartons',
    description: '12 cartons of organic 2% milk, nearing expiration date.',
    quantity: '12 cartons',
    expiry: new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000), // Expires in 3 days
    location: { address: '101 Maple Rd, Anytown, USA', lat: 34.06, lng: -118.23 },
    imageUrl: foodImages["4"].imageUrl,
    imageHint: foodImages["4"].imageHint,
    status: 'completed',
    donor: mockUsers[3],
    claimedBy: mockUsers[4],
    createdAt: new Date(new Date().getTime() - 2 * 24 * 60 * 60 * 1000), // Created 2 days ago
  },
];

// Helper to get a mock user. In a real app, this would come from an auth hook.
export const getMockUser = (role: UserRole): User => {
  const user = mockUsers.find(u => u.role === role);
  if (!user) {
    // Return a default user if no user with the specified role is found
    return mockUsers[0];
  }
  return user;
};
