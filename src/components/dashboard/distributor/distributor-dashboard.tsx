import type { SerializableUser, Donation } from "@/lib/types";
import DonationMap from "./donation-map";

interface DistributorDashboardProps {
	user: SerializableUser;
	donations?: Donation[];
}

export default function DistributorDashboard({
	user,
	donations,
}: DistributorDashboardProps) {
	return (
		<div className='space-y-6 h-full flex flex-col'>
			<div>
				<h1 className='text-3xl font-bold tracking-tight font-headline'>
					Find Donations Near You
				</h1>
				<p className='text-muted-foreground'>
					Explore the map to discover available food donations in your
					area.
				</p>
			</div>
			<div className='flex-grow min-h-[400px]'>
				<DonationMap donations={donations} />
			</div>
		</div>
	);
}
