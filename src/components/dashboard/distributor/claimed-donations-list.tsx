import type { Donation } from "@/lib/types";
import DonationCard from "@/components/shared/donation-card";

export default function ClaimedDonationsList({
	donations,
}: {
	donations: Donation[];
}) {
	if (donations.length === 0) {
		return (
			<div className='text-center py-16'>
				<h2 className='text-xl font-semibold'>No Claimed Donations</h2>
				<p className='text-muted-foreground mt-2'>
					Claim donations from the Available tab to see them here.
				</p>
			</div>
		);
	}

	return (
		<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
			{donations.map((donation) => (
				<DonationCard key={donation.id} donation={donation} />
			))}
		</div>
	);
}
