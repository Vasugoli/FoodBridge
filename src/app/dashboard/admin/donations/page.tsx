import { DonationTable } from "@/components/dashboard/admin/donation-table";
import { mockDonations } from "@/lib/placeholder-data";

export default function ManageDonationsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight font-headline mb-6">Manage All Donations</h1>
      <DonationTable donations={mockDonations} />
    </div>
  );
}
