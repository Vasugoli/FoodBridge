import { DonationTable } from "@/components/dashboard/admin/donation-table";
import { getDonationsFromDb } from "@/lib/db";
import { mockDonations } from "@/lib/placeholder-data";

export default async function ManageDonationsPage() {
	// Try to fetch from MongoDB, fallback to mock data if not available
	let donations;
	try {
		donations = await getDonationsFromDb();
		if (!donations || donations.length === 0) {
			donations = mockDonations;
		}
	} catch (error) {
		// Fallback to mock data if MongoDB is not configured
		donations = mockDonations;
	}

	return (
		<div>
			<h1 className='text-3xl font-bold tracking-tight font-headline mb-6'>
				Manage All Donations
			</h1>
			<DonationTable donations={donations} />
		</div>
	);
}
