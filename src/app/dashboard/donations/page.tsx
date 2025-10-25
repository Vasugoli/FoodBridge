import { getMockUser, mockDonations } from "@/lib/placeholder-data";
import MyDonationsList from "@/components/dashboard/donor/my-donations-list";
import AvailableDonationsList from "@/components/dashboard/distributor/available-donations-list";
import type { UserRole } from "@/lib/types";

export default function DonationsPage({ searchParams }: { searchParams: { role: string } }) {
  // In a real app, you'd get the user from the session.
  const role = (searchParams.role as UserRole) || 'donor';
  const user = getMockUser(role);

  if (user.role === 'donor') {
    const myDonations = mockDonations.filter(d => d.donor.id === user.id);
    return (
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline mb-6">My Donations</h1>
        <MyDonationsList donations={myDonations} />
      </div>
    );
  }

  if (user.role === 'distributor') {
    const availableDonations = mockDonations.filter(d => d.status === 'available');
    return (
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline mb-6">Available Donations</h1>
        <AvailableDonationsList donations={availableDonations} />
      </div>
    );
  }

  // Fallback for admin or other roles
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight font-headline">Donations</h1>
      <p className="text-muted-foreground">You do not have a specific donation view.</p>
    </div>
  );
}
